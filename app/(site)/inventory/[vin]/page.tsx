import { notFound } from "next/navigation";
import { getVehicleByVin } from "@/lib/inventory";
import { formatUsd, monthlyEstimate, titleCase } from "@/lib/format";
import { LeadForm } from "@/components/site/lead-form";

export default async function VehiclePage({ params }: { params: Promise<{ vin: string }> }) {
  const { vin } = await params;
  const vehicle = await getVehicleByVin(vin);
  if (!vehicle) notFound();
  const images = (vehicle.vehicle_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const price = vehicle.internet_price ?? vehicle.msrp;
  const discount =
    vehicle.discount ??
    (vehicle.msrp && vehicle.internet_price ? Number(vehicle.msrp) - Number(vehicle.internet_price) : null);
  const monthly = monthlyEstimate(price ? Number(price) : null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">
        {titleCase(vehicle.brand)} · {titleCase(vehicle.condition)} · {titleCase(vehicle.status)}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h1>
      <p className="text-muted-foreground">{vehicle.trim}</p>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="overflow-hidden rounded-2xl bg-zinc-100">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0].url} alt={images[0].alt ?? ""} className="w-full object-cover" />
            ) : null}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <Spec label="MSRP" value={formatUsd(vehicle.msrp ? Number(vehicle.msrp) : null)} />
            <Spec label="Discount" value={discount ? formatUsd(Number(discount)) : "—"} />
            <Spec label="Incentives" value="Ask an advisor" />
            <Spec label="Est. price" value={formatUsd(price ? Number(price) : null)} />
          </div>
          {monthly ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Display-only estimate: {formatUsd(monthly)}/mo at 6.9% APR for 72 months. Not a credit offer.
            </p>
          ) : null}
          <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            <Spec label="VIN" value={vehicle.vin} />
            <Spec label="Stock" value={vehicle.stock_number} />
            <Spec label="Engine" value={vehicle.engine} />
            <Spec label="Transmission" value={vehicle.transmission} />
            <Spec label="Drivetrain" value={vehicle.drivetrain} />
            <Spec label="Exterior" value={vehicle.exterior_color} />
            <Spec label="Interior" value={vehicle.interior_color} />
            <Spec label="MPG" value={vehicle.mpg_city ? `${vehicle.mpg_city}/${vehicle.mpg_hwy}` : null} />
            <Spec label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : "New"} />
          </dl>
          {vehicle.vehicle_ratings?.length ? (
            <div className="mt-8">
              <h2 className="font-semibold">Ratings on file</h2>
              <ul className="mt-2 text-sm text-muted-foreground">
                {vehicle.vehicle_ratings.map((rating) => (
                  <li key={rating.id}>
                    {rating.source}: {rating.score}
                    {rating.rating_count ? ` (${rating.rating_count})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <LeadForm type="sales" brand={vehicle.brand} vehicleId={vehicle.id} />
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}
