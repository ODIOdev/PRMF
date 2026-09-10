import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { rememberSupabaseFailure, withSupabaseFallback } from "@/lib/supabase/availability";
import type { Vehicle, VehicleBrand, VehicleCondition, VehicleStatus } from "@/lib/types";

const emptyCounts = { ford: 0, lincoln: 0, newCount: 0, usedCount: 0 };

const withFallback = withSupabaseFallback;

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
  return withFallback([], async () => {
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
    if (error) {
      rememberSupabaseFailure(error);
      return [];
    }
    return (data ?? []) as Vehicle[];
  });
}

export async function searchVehicles(
  q: string,
  filters: Pick<InventoryFilters, "brand" | "condition"> = {},
  limit = 8,
) {
  const term = sanitizeSearchTerm(q);
  if (!term) return [];

  return withFallback([], async () => {
    const supabase = await createClient();
    let query = supabase
      .from("vehicles")
      .select("id, vin, year, make, model, trim, brand, condition, stock_number, internet_price, msrp, features")
      .in("status", ["in_stock", "in_transit"])
      .or(searchOrFilter(term))
      .order("year", { ascending: false })
      .limit(limit);

    if (filters.brand) query = query.eq("brand", filters.brand);
    if (filters.condition) query = query.eq("condition", filters.condition);

    const { data, error } = await query;
    if (error) {
      rememberSupabaseFailure(error);
      return [];
    }
    return (data ?? []) as Pick<
      Vehicle,
      "id" | "vin" | "year" | "make" | "model" | "trim" | "brand" | "condition" | "stock_number" | "internet_price" | "msrp" | "features"
    >[];
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getVehicleByVin(vin: string) {
  const segment = vin.trim();
  if (!segment || !/^[A-Za-z0-9-]+$/.test(segment)) return null;
  return withFallback(null, async () => {
    const supabase = await createClient();
    let query = supabase.from("vehicles").select("*, vehicle_images(*), vehicle_ratings(*)");
    query = UUID_RE.test(segment) ? query.or(`vin.eq.${segment},id.eq.${segment}`) : query.eq("vin", segment);
    const { data, error } = await query.maybeSingle();
    if (error) {
      rememberSupabaseFailure(error);
      return null;
    }
    return data as Vehicle | null;
  });
}

export async function getFeaturedVehicles(limit = 6) {
  return withFallback([], async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, vehicle_images(*)")
      .in("status", ["in_stock", "in_transit"])
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      rememberSupabaseFailure(error);
      return [];
    }
    return (data ?? []) as Vehicle[];
  });
}

export const getShopModels = cache(async (brand?: VehicleBrand) => {
  return withFallback([], async () => {
    const supabase = await createClient();
    let query = supabase.from("vehicles").select("model").in("status", ["in_stock", "in_transit"]).not("model", "is", null);
    if (brand) query = query.eq("brand", brand);
    const { data, error } = await query;
    if (error) {
      rememberSupabaseFailure(error);
      return [];
    }
    return [...new Set((data ?? []).map((row) => row.model).filter(Boolean) as string[])].sort();
  });
});

export async function getInventoryCounts() {
  return withFallback(emptyCounts, async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("brand, condition, status")
      .in("status", ["in_stock", "in_transit"]);
    if (error) {
      rememberSupabaseFailure(error);
      return emptyCounts;
    }
    const rows = data ?? [];
    return {
      ford: rows.filter((r) => r.brand === "ford").length,
      lincoln: rows.filter((r) => r.brand === "lincoln").length,
      newCount: rows.filter((r) => r.condition === "new").length,
      usedCount: rows.filter((r) => r.condition === "used" || r.condition === "cpo").length,
    };
  });
}
