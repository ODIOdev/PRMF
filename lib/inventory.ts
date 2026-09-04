import { createClient } from "@/lib/supabase/server";
import type { Vehicle, VehicleBrand, VehicleCondition, VehicleStatus } from "@/lib/types";

export type InventoryFilters = {
  brand?: VehicleBrand;
  condition?: VehicleCondition;
  status?: VehicleStatus;
  q?: string;
  model?: string;
  maxPrice?: number;
  years?: number[];
  ev?: boolean;
  commercial?: boolean;
  body?: "coupe" | "suv" | "truck" | "van" | "wagon";
};

function sanitizeSearchTerm(q: string) {
  return q.replace(/[%*,()]/g, " ").replace(/\s+/g, " ").trim();
}

function searchOrFilter(term: string) {
  const variants = new Set([term]);
  const compact = term.replace(/[\s-]/g, "");
  const hyphenated = compact.replace(/([a-zA-Z]+)(\d)/, "$1-$2");
  if (hyphenated !== term) variants.add(hyphenated);
  if (compact !== term) variants.add(compact);

  const clauses = [...variants].flatMap((value) => [
    `make.ilike.%${value}%`,
    `model.ilike.%${value}%`,
    `trim.ilike.%${value}%`,
    `stock_number.ilike.%${value}%`,
    `vin.ilike.%${value}%`,
    `body_style.ilike.%${value}%`,
  ]);
  if (/^\d{4}$/.test(term)) clauses.push(`year.eq.${term}`);
  const brand = term.toLowerCase();
  if (brand === "ford" || brand === "lincoln") clauses.push(`brand.eq.${brand}`);
  return clauses.join(",");
}

export async function getVehicles(filters: InventoryFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("vehicles")
    .select("*, vehicle_images(*), vehicle_ratings(*)")
    .in("status", filters.status ? [filters.status] : ["in_stock", "in_transit"])
    .order("year", { ascending: false });

  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.model) query = query.ilike("model", `%${filters.model}%`);
  if (filters.maxPrice) query = query.lte("internet_price", filters.maxPrice);
  if (filters.years?.length) query = query.in("year", filters.years);
  if (filters.ev) {
    query = query.or("fuel.ilike.%electric%,model.ilike.%lightning%,model.ilike.%mach-e%,model.ilike.%mache%");
  }
  if (filters.commercial) {
    query = query.or("model.ilike.%transit%,body_style.ilike.%van%");
  }
  if (filters.body === "coupe") {
    query = query.ilike("model", "%Mustang%").not("model", "ilike", "%Mach%");
  }
  if (filters.body === "suv") {
    query = query.or(
      "model.ilike.%Bronco%,model.ilike.%Explorer%,model.ilike.%Expedition%,model.ilike.%Escape%,model.ilike.%Edge%,model.ilike.%Mach-E%,model.ilike.%Aviator%,model.ilike.%Nautilus%,model.ilike.%Corsair%,model.ilike.%Navigator%",
    );
  }
  if (filters.body === "truck") {
    query = query.or(
      "model.ilike.%F-150%,model.ilike.%F-250%,model.ilike.%F-350%,model.ilike.%F-450%,model.ilike.%F-550%,model.ilike.%Ranger%,model.ilike.%Maverick%",
    );
  }
  if (filters.body === "van") {
    query = query.or("model.ilike.%Transit%,body_style.ilike.%van%");
  }
  if (filters.body === "wagon") {
    query = query.or("model.ilike.%Passenger%,body_style.ilike.%wagon%");
  }
  const q = filters.q ? sanitizeSearchTerm(filters.q) : "";
  if (q) query = query.or(searchOrFilter(q));

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Vehicle[];
}

export async function searchVehicles(
  q: string,
  filters: Pick<InventoryFilters, "brand" | "condition"> = {},
  limit = 8,
) {
  const term = sanitizeSearchTerm(q);
  if (!term) return [];

  const supabase = await createClient();
  let query = supabase
    .from("vehicles")
    .select("id, vin, year, make, model, trim, brand, condition, stock_number, internet_price, msrp")
    .in("status", ["in_stock", "in_transit"])
    .or(searchOrFilter(term))
    .order("year", { ascending: false })
    .limit(limit);

  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.condition) query = query.eq("condition", filters.condition);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Pick<
    Vehicle,
    "id" | "vin" | "year" | "make" | "model" | "trim" | "brand" | "condition" | "stock_number" | "internet_price" | "msrp"
  >[];
}

export async function getVehicleByVin(vin: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*), vehicle_ratings(*)")
    .eq("vin", vin)
    .maybeSingle();
  if (error) throw error;
  return data as Vehicle | null;
}

export async function getFeaturedVehicles(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .in("status", ["in_stock", "in_transit"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Vehicle[];
}

export async function getShopModels(brand?: VehicleBrand) {
  const supabase = await createClient();
  let query = supabase.from("vehicles").select("model").in("status", ["in_stock", "in_transit"]).not("model", "is", null);
  if (brand) query = query.eq("brand", brand);
  const { data, error } = await query;
  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.model).filter(Boolean) as string[])].sort();
}

export async function getInventoryCounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("brand, condition, status")
    .in("status", ["in_stock", "in_transit"]);
  if (error) throw error;
  const rows = data ?? [];
  return {
    ford: rows.filter((r) => r.brand === "ford").length,
    lincoln: rows.filter((r) => r.brand === "lincoln").length,
    newCount: rows.filter((r) => r.condition === "new").length,
    usedCount: rows.filter((r) => r.condition === "used" || r.condition === "cpo").length,
  };
}
