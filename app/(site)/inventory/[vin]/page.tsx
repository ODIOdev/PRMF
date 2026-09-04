import { notFound } from "next/navigation";
import { getVehicleByVin } from "@/lib/inventory";
import { formatUsd, listingPrice, monthlyEstimate, titleCase } from "@/lib/format";
import { LeadForm } from "@/components/site/lead-form";
import { getDictionary } from "@/lib/get-dictionary";

export default async function VehiclePage({ params }: { params: Promise<{ vin: string }> }) {
  const { vin } = await params;
  const vehicle = await getVehicleByVin(vin);
  if (!vehicle) notFound();
  const images = (vehicle.vehicle_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const price = listingPrice(vehicle);
  const callForPrice = price == null;
  const discount =
    callForPrice
      ? null
      : vehicle.discount ??
        (vehicle.msrp && vehicle.internet_price ? Number(vehicle.msrp) - Number(vehicle.internet_price) : null);
  const monthly = monthlyEstimate(price);
  const { t } = await getDictionary();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">
        {titleCase(vehicle.brand)} · {t.condition[vehicle.condition] ?? titleCase(vehicle.condition)} ·{" "}
        {t.status[vehicle.status] ?? titleCase(vehicle.status)}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h1>
      <p className="text-sm text-muted-foreground">{vehicle.trim}</p>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="overflow-hidden border border-chrome bg-muted">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0].url} alt={images[0].alt ?? ""} className="w-full object-cover" />
            ) : null}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <Spec label={t.msrp} value={formatUsd(vehicle.msrp ? Number(vehicle.msrp) : null)} />
            <Spec label={t.discount} value={discount ? formatUsd(Number(discount)) : "—"} />
            <Spec label={t.incentives} value={t.askAdvisor} />
            <Spec label={t.estPrice} value={callForPrice ? t.callForPrice : formatUsd(price)} />
          </div>
          {monthly ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t.monthlyDisclaimer(formatUsd(monthly))}
            </p>
          ) : null}
          <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            <Spec label={t.spec.vin} value={vehicle.vin} />
            <Spec label={t.spec.stock} value={vehicle.stock_number} />
            <Spec label={t.spec.engine} value={vehicle.engine} />
            <Spec label={t.spec.transmission} value={vehicle.transmission} />
            <Spec label={t.spec.drivetrain} value={vehicle.drivetrain} />
            <Spec label={t.spec.exterior} value={vehicle.exterior_color} />
            <Spec label={t.spec.interior} value={vehicle.interior_color} />
            <Spec label={t.spec.mpg} value={vehicle.mpg_city ? `${vehicle.mpg_city}/${vehicle.mpg_hwy}` : null} />
            <Spec label={t.spec.mileage} value={vehicle.mileage ? t.miles(vehicle.mileage.toLocaleString()) : t.spec.newMileage} />
          </dl>
          {vehicle.vehicle_ratings?.length ? (
            <div className="mt-8">
              <h2 className="font-semibold">{t.ratings}</h2>
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
