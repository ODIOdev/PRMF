import { createDeskClient } from "@/lib/admin/session";
import {
  INVENTORY_PAGE_SIZE,
  INVENTORY_STATUSES,
  InventoryDesk,
  inventoryStatusView,
  type InventoryLotRow,
  type InventoryVehicle,
} from "@/components/admin/inventory-desk";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; condition?: string; status?: string; q?: string; aged?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createDeskClient();
  const status = inventoryStatusView(params.status);
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * INVENTORY_PAGE_SIZE;
  const to = from + INVENTORY_PAGE_SIZE - 1;
  // Request-time cutoff for the aged-lot filter (not render-cached).
  // eslint-disable-next-line react-hooks/purity -- server request clock
  const agedCutoff = new Date(Date.now() - 60 * 86_400_000).toISOString();

  let query = supabase
    .from("vehicles")
    .select(
      "id, vin, year, make, model, trim, brand, condition, status, internet_price, msrp, features, stock_number, created_at, mileage, exterior_color, vehicle_images(url, sort_order)",
      { count: "exact" },
    )
    .range(from, to);

  if (params.brand === "ford" || params.brand === "lincoln") query = query.eq("brand", params.brand);
  if (params.condition === "new" || params.condition === "used" || params.condition === "cpo") {
    query = query.eq("condition", params.condition);
  }
  if (params.aged === "1") {
    query = query.eq("status", "in_stock").lte("created_at", agedCutoff);
  } else if (status === "live") {
    query = query.in("status", ["in_stock", "in_transit"]);
  } else if (INVENTORY_STATUSES.includes(status as (typeof INVENTORY_STATUSES)[number])) {
    query = query.eq("status", status);
  }
  if (params.q?.trim()) {
    const q = params.q.replace(/[%*,()]/g, " ").replace(/\s+/g, " ").trim();
    if (q) query = query.or(`make.ilike.%${q}%,model.ilike.%${q}%,vin.ilike.%${q}%,stock_number.ilike.%${q}%`);
  }

  const liveView = params.aged === "1" || status === "live" || status === "in_stock" || status === "in_transit";
  query = liveView ? query.order("created_at", { ascending: true }) : query.order("updated_at", { ascending: false });

  const [{ data: lot }, { data, count }] = await Promise.all([
    supabase.from("vehicles").select("id, brand, status, condition, created_at, internet_price, msrp, features, year, make, model, trim, vin, stock_number"),
    query,
  ]);

  return (
    <InventoryDesk
      params={params}
      lot={(lot ?? []) as InventoryLotRow[]}
      vehicles={(data ?? []) as InventoryVehicle[]}
      total={count ?? 0}
    />
  );
}
