import { getVehicles } from "@/lib/inventory";
import { VehicleCard } from "@/components/site/vehicle-card";
import type { VehicleBrand, VehicleCondition } from "@/lib/types";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; condition?: string; q?: string; model?: string }>;
}) {
  const params = await searchParams;
  const brand = params.brand === "ford" || params.brand === "lincoln" ? (params.brand as VehicleBrand) : undefined;
  const condition =
    params.condition === "new" || params.condition === "used" || params.condition === "cpo"
      ? (params.condition as VehicleCondition)
      : undefined;
  const vehicles = await getVehicles({
    brand,
    condition,
    q: params.q,
    model: params.model,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Inventory</h1>
      <p className="mt-2 text-muted-foreground">{vehicles.length} vehicles matching your search.</p>
      <form className="mt-6 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-4">
        <select name="brand" defaultValue={brand ?? ""} className="h-11 rounded-lg border px-3">
          <option value="">Any brand</option>
          <option value="ford">Ford</option>
          <option value="lincoln">Lincoln</option>
        </select>
        <select name="condition" defaultValue={condition ?? ""} className="h-11 rounded-lg border px-3">
          <option value="">New and used</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="cpo">Certified</option>
        </select>
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search" className="h-11 rounded-lg border px-3" />
        <button className="h-11 rounded-lg bg-primary text-primary-foreground">Filter</button>
      </form>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
