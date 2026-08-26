import { createClient } from "@/lib/supabase/server";
import type { Vehicle, VehicleBrand, VehicleCondition, VehicleStatus } from "@/lib/types";

export type InventoryFilters = {
  brand?: VehicleBrand;
  condition?: VehicleCondition;
  status?: VehicleStatus;
  q?: string;
  model?: string;
  maxPrice?: number;
};

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
  if (filters.q) {
    query = query.or(
      `make.ilike.%${filters.q}%,model.ilike.%${filters.q}%,trim.ilike.%${filters.q}%,stock_number.ilike.%${filters.q}%,vin.ilike.%${filters.q}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Vehicle[];
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
