import { readFileSync } from "node:fs";
import { createAdminClient } from "../lib/supabase/admin";
import type { VehicleBrand, VehicleCondition, VehicleStatus } from "../lib/types";

function loadEnvLocal() {
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const UA = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

type JsonLdVehicle = {
  name?: string;
  url?: string;
  vehicleIdentificationNumber?: string;
  sku?: string;
  vehicleModelDate?: number;
  brand?: { name?: string };
  model?: string;
  image?: string | string[];
  color?: string;
  vehicleInteriorColor?: string;
  vehicleTransmission?: string;
  driveWheelConfiguration?: string;
  vehicleEngine?: string;
  fuelType?: string;
  fuelEfficiency?: string;
  description?: string;
  itemCondition?: string;
  vehicleIdentification?: { mileageFromOdometer?: { value?: number } };
  mileageFromOdometer?: { value?: number } | string;
  offers?: { price?: string; availability?: string };
};

const SOURCES = [
  {
    site: "premierfordinc.com",
    brand: "ford" as VehicleBrand,
    condition: "new" as VehicleCondition,
    url: "https://www.premierfordinc.com/new-inventory/new-ford-inventory-brooklyn-ny/index.htm",
  },
  {
    site: "premierfordinc.com",
    brand: "ford" as VehicleBrand,
    condition: "used" as VehicleCondition,
    url: "https://www.premierfordinc.com/used-inventory/used-vehicle-inventory-brooklyn-ny/index.htm",
  },
  {
    site: "premierlincolnbrooklyn.com",
    brand: "lincoln" as VehicleBrand,
    condition: "new" as VehicleCondition,
    url: "https://www.premierlincolnbrooklyn.com/new-inventory/new-lincoln-inventory-brooklyn-ny/index.htm",
  },
  {
    site: "premierlincolnbrooklyn.com",
    brand: "lincoln" as VehicleBrand,
    condition: "used" as VehicleCondition,
    url: "https://www.premierlincolnbrooklyn.com/used-inventory/index.htm",
  },
];

function decode(value?: string) {
  return (value ?? "")
    .replaceAll("&reg;", "")
    .replaceAll("&amp;", "&")
    .replaceAll("\\u003c", "<")
    .replaceAll("\\u003e", ">")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseMpg(value?: string) {
  const match = value?.match(/(\d+)\s*(?:City)?\s*\/?\s*(\d+)/i);
  if (!match) return { city: null, hwy: null };
  return { city: Number(match[1]), hwy: Number(match[2]) };
}

function parseMileage(item: JsonLdVehicle) {
  const raw =
    item.mileageFromOdometer ??
    item.vehicleIdentification?.mileageFromOdometer;
  if (!raw) return null;
  if (typeof raw === "string") {
    const n = Number(raw.replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(raw.value);
  return Number.isFinite(n) ? n : null;
}

function mapStatus(availability?: string): VehicleStatus {
  const value = (availability ?? "").toLowerCase();
  if (value.includes("preorder") || value.includes("outofstock")) return "in_transit";
  return "in_stock";
}

function mapBrand(name?: string, fallback: VehicleBrand = "other"): VehicleBrand {
  const n = (name ?? "").toLowerCase();
  if (n.includes("ford")) return "ford";
  if (n.includes("lincoln")) return "lincoln";
  return fallback;
}

function mapCondition(item: JsonLdVehicle, fallback: VehicleCondition): VehicleCondition {
  const raw = `${item.itemCondition ?? ""} ${item.name ?? ""}`.toLowerCase();
  if (raw.includes("certified") || raw.includes("cpo")) return "cpo";
  if (raw.includes("newcondition") || raw.includes("new ")) return "new";
  if (raw.includes("used")) return "used";
  return fallback;
}

function trimFromName(name: string, model?: string) {
  let rest = decode(name).replace(/^(New|Used|Certified)\s+/i, "");
  if (model) rest = rest.replace(new RegExp(model, "i"), "");
  rest = rest.replace(/^(Ford|Lincoln)\s+/i, "").trim();
  return rest || null;
}

async function fetchPage(url: string) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function extractItems(html: string): JsonLdVehicle[] {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) return [];
  try {
    const json = JSON.parse(match[1]);
    return (json.about?.offers?.itemOffered ?? []) as JsonLdVehicle[];
  } catch {
    return [];
  }
}

async function collectSource(source: (typeof SOURCES)[number]) {
  const seen = new Set<string>();
  const vehicles: JsonLdVehicle[] = [];
  for (let start = 0; start < 800; start += 24) {
    const url = start === 0 ? source.url : `${source.url}?start=${start}`;
    const html = await fetchPage(url);
    const items = extractItems(html);
    const fresh = items.filter((item) => {
      const vin = item.vehicleIdentificationNumber;
      if (!vin || seen.has(vin)) return false;
      seen.add(vin);
      return true;
    });
    if (fresh.length === 0) break;
    vehicles.push(...fresh);
    await new Promise((r) => setTimeout(r, 400));
  }
  return vehicles.map((item) => ({ item, source }));
}

async function main() {
  const supabase = createAdminClient();
  let upserted = 0;

  for (const source of SOURCES) {
    const collected = await collectSource(source);
    console.log(`${source.site} ${source.condition}: ${collected.length}`);

    for (const { item } of collected) {
      const vin = item.vehicleIdentificationNumber;
      if (!vin) continue;
      const mpg = parseMpg(item.fuelEfficiency);
      const price = item.offers?.price ? Number(item.offers.price) : null;
      const brand = mapBrand(item.brand?.name, source.brand);
      const row = {
        vin,
        stock_number: item.sku ?? null,
        brand,
        condition: mapCondition(item, source.condition),
        year: item.vehicleModelDate ?? null,
        make: item.brand?.name ?? (brand === "lincoln" ? "Lincoln" : "Ford"),
        model: item.model ?? null,
        trim: trimFromName(item.name ?? "", item.model),
        body_style: null as string | null,
        drivetrain: item.driveWheelConfiguration ?? null,
        engine: decode(item.vehicleEngine) || null,
        transmission: decode(item.vehicleTransmission) || null,
        fuel: item.fuelType ?? null,
        mpg_city: mpg.city,
        mpg_hwy: mpg.hwy,
        mileage: parseMileage(item),
        exterior_color: item.color ?? null,
        interior_color: item.vehicleInteriorColor ?? null,
        status: mapStatus(item.offers?.availability),
        msrp: source.condition === "new" ? price : null,
        internet_price: price,
        discount: null as number | null,
        incentives: [],
        features: [],
        description: decode(item.description) || null,
        source_url: item.url ?? null,
        source_site: source.site,
      };

      const { data, error } = await supabase
        .from("vehicles")
        .upsert(row, { onConflict: "vin" })
        .select("id")
        .single();
      if (error) {
        console.error("upsert failed", vin, error.message);
        continue;
      }

      const photos = Array.isArray(item.image) ? item.image : item.image ? [item.image] : [];
      const unique = [...new Set(photos)];
      if (unique.length) {
        await supabase.from("vehicle_images").delete().eq("vehicle_id", data.id);
        await supabase.from("vehicle_images").insert(
          unique.slice(0, 12).map((url, sort_order) => ({
            vehicle_id: data.id,
            url,
            alt: `${row.year} ${row.make} ${row.model}`,
            sort_order,
          })),
        );
      }
      upserted += 1;
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  console.log("Upserted", upserted, "vehicles");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
