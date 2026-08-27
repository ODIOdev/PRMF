import { getVehicles } from "@/lib/inventory";
import { VehicleCard } from "@/components/site/vehicle-card";
import { InventorySearch } from "@/components/site/inventory-search";
import type { VehicleBrand, VehicleCondition } from "@/lib/types";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    brand?: string;
    condition?: string;
    q?: string;
    model?: string;
    year?: string;
    ev?: string;
    commercial?: string;
    body?: string;
  }>;
}) {
  const params = await searchParams;
  const brand = params.brand === "ford" || params.brand === "lincoln" ? (params.brand as VehicleBrand) : undefined;
  const condition =
    params.condition === "new" || params.condition === "used" || params.condition === "cpo"
      ? (params.condition as VehicleCondition)
      : undefined;
  const years = params.year
    ?.split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 1990);
  const body =
    params.body === "coupe" ||
    params.body === "suv" ||
    params.body === "truck" ||
    params.body === "van" ||
    params.body === "wagon"
      ? params.body
      : undefined;
  const vehicles = await getVehicles({
    brand,
    condition,
    q: params.q,
    model: params.model,
    years,
    ev: params.ev === "1",
    commercial: params.commercial === "1",
    body,
  });

  const title = params.commercial === "1"
    ? "Commercial inventory"
    : params.ev === "1"
      ? "Ford EV inventory"
      : body
        ? body === "suv"
          ? "SUVs"
          : body.charAt(0).toUpperCase() + body.slice(1) + "s"
      : params.model
        ? params.model
        : "Inventory";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">Shop</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{vehicles.length} vehicles matching your search.</p>
      <div className="mt-6">
        <InventorySearch brand={brand ?? ""} condition={condition ?? ""} q={params.q ?? ""} submitLabel="Filter" />
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
