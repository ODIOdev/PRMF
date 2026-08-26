import Link from "next/link";
import { getVehicles } from "@/lib/inventory";
import { VehicleCard } from "@/components/site/vehicle-card";
import type { VehicleBrand } from "@/lib/types";

export default async function BrandPage({ brand }: { brand: VehicleBrand }) {
  const vehicles = await getVehicles({ brand });

  return (
    <div>
      <section className={`px-4 py-16 text-white ${brand === "ford" ? "bg-ford" : "bg-lincoln"}`}>
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.25em] text-white/70">Premier Brooklyn</p>
          <h1 className="mt-3 text-4xl font-semibold">{brand === "ford" ? "Ford" : "Lincoln"}</h1>
          <p className="mt-3 max-w-xl text-white/80">
            {brand === "ford"
              ? "Trucks, SUVs, EVs and commercial vans for Brooklyn drivers."
              : "Navigator, Aviator, Nautilus and Corsair with a quieter ownership experience."}
          </p>
          <Link
            href={`/inventory?brand=${brand}`}
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2 text-sm text-zinc-900"
          >
            Browse {vehicles.length} vehicles
          </Link>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.slice(0, 9).map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
