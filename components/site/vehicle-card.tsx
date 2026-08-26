import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { formatUsd, monthlyEstimate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const image = vehicle.vehicle_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  const price = vehicle.internet_price ?? vehicle.msrp;
  const discount =
    vehicle.discount ??
    (vehicle.msrp && vehicle.internet_price ? Number(vehicle.msrp) - Number(vehicle.internet_price) : null);
  const href = `/inventory/${vehicle.vin ?? vehicle.id}`;
  const monthly = monthlyEstimate(price ? Number(price) : null);

  return (
    <Link href={href} className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/10] bg-zinc-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Photo coming soon</div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className={vehicle.brand === "lincoln" ? "bg-lincoln text-white" : "bg-ford text-white"}>
            {vehicle.brand}
          </Badge>
          <Badge variant="secondary">{vehicle.condition}</Badge>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-lg font-semibold leading-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
          <p className="text-sm text-muted-foreground">{vehicle.trim || vehicle.body_style || vehicle.stock_number}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <PriceCell label="MSRP" value={formatUsd(vehicle.msrp ? Number(vehicle.msrp) : null)} />
          <PriceCell label="Discount" value={discount ? formatUsd(Number(discount)) : "—"} />
          <PriceCell label="Incentives" value="See details" />
          <PriceCell label="Est. price" value={formatUsd(price ? Number(price) : null)} emphasize />
        </div>
        {monthly ? (
          <p className="text-xs text-muted-foreground">About {formatUsd(monthly)}/mo estimated at 6.9% for 72 months.</p>
        ) : null}
      </div>
    </Link>
  );
}

function PriceCell({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={emphasize ? "font-semibold" : ""}>{value}</p>
    </div>
  );
}
