import Link from "next/link";
import { getVehicles } from "@/lib/inventory";
import { VehicleCard } from "@/components/site/vehicle-card";
import type { VehicleBrand } from "@/lib/types";
import { getDictionary } from "@/lib/get-dictionary";

export default async function BrandPage({ brand }: { brand: VehicleBrand }) {
  const vehicles = await getVehicles({ brand });
  const isFord = brand === "ford";
  const { t } = await getDictionary();

  return (
    <div>
      <section className={`px-4 py-12 text-white ${isFord ? "bg-ford" : "bg-lincoln"}`}>
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/65">Premier Brooklyn</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{isFord ? "Ford" : "Lincoln"}</h1>
          <p className="mt-3 max-w-xl text-sm text-white/80">
            {isFord ? t.brand.fordBody : t.brand.lincolnBody}
          </p>
          <Link
            href={`/inventory?brand=${brand}`}
            className="mt-6 inline-flex h-11 items-center bg-white px-5 text-sm font-medium text-ford"
          >
            {t.brand.browse(vehicles.length)}
          </Link>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.slice(0, 9).map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
