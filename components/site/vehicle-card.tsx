"use client";

import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { formatUsd, monthlyEstimate } from "@/lib/format";
import { useLocale } from "@/components/site/locale-provider";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useLocale();
  const image = vehicle.vehicle_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  const price = vehicle.internet_price ?? vehicle.msrp;
  const discount =
    vehicle.discount ??
    (vehicle.msrp && vehicle.internet_price ? Number(vehicle.msrp) - Number(vehicle.internet_price) : null);
  const href = `/inventory/${vehicle.vin ?? vehicle.id}`;
  const monthly = monthlyEstimate(price ? Number(price) : null);

  return (
    <Link href={href} className="group border border-chrome bg-white transition hover:border-ford">
      <div className="relative aspect-[16/10] bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t.photoSoon}</div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${
              vehicle.brand === "lincoln" ? "bg-lincoln" : "bg-ford"
            }`}
          >
            {vehicle.brand}
          </span>
          <span className="bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
            {t.condition[vehicle.condition] ?? vehicle.condition}
          </span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-lg font-semibold leading-tight tracking-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{vehicle.trim || vehicle.body_style || vehicle.stock_number}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-chrome pt-3 text-sm">
          <PriceCell label={t.msrp} value={formatUsd(vehicle.msrp ? Number(vehicle.msrp) : null)} />
          <PriceCell label={t.discount} value={discount ? formatUsd(Number(discount)) : "—"} />
          <PriceCell label={t.incentives} value={t.seeDetails} />
          <PriceCell label={t.estPrice} value={formatUsd(price ? Number(price) : null)} emphasize />
        </div>
        {monthly ? (
          <p className="text-xs text-muted-foreground">{t.monthlyEst(formatUsd(monthly))}</p>
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
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={emphasize ? "font-semibold text-ford" : ""}>{value}</p>
    </div>
  );
}
