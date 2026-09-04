import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { InventoryDeskSearch } from "@/components/admin/inventory-desk-search";
import { daysOnLot, firstPhoto } from "@/lib/admin/format";
import { formatUsd, listingPrice, titleCase, vehicleCallForPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const INVENTORY_PAGE_SIZE = 40;
export const INVENTORY_STATUSES = ["in_stock", "in_transit", "sold", "hidden"] as const;

export type InventoryParams = {
  brand?: string;
  condition?: string;
  status?: string;
  q?: string;
  aged?: string;
  page?: string;
};

export type InventoryLotRow = {
  id: string;
  brand: string | null;
  status: string;
  condition: string | null;
  created_at: string;
  internet_price: number | null;
  msrp: number | null;
  features?: unknown;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  vin: string | null;
  stock_number: string | null;
};

export type InventoryVehicle = InventoryLotRow & {
  mileage: number | null;
  exterior_color: string | null;
  vehicle_images?: { url: string; sort_order: number }[] | null;
};

const STATUS_TONE: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-900",
  in_transit: "bg-[#dbe7f5] text-ford",
  sold: "bg-[#eceff2] text-[#5b6570]",
  hidden: "bg-amber-100 text-amber-950",
};

export function inventoryHref(params: InventoryParams, next: Record<string, string | undefined> = {}) {
  const search = new URLSearchParams();
  const merged = {
    brand: params.brand,
    condition: params.condition,
    status: params.status,
    q: params.q,
    aged: params.aged,
    page: undefined as string | undefined,
    ...next,
  };
  if (merged.brand === "ford" || merged.brand === "lincoln") search.set("brand", merged.brand);
  if (merged.condition === "new" || merged.condition === "used" || merged.condition === "cpo") {
    search.set("condition", merged.condition);
  }
  if (merged.status && merged.status !== "live") search.set("status", merged.status);
  if (merged.q?.trim()) search.set("q", merged.q.trim());
  if (merged.aged === "1") search.set("aged", "1");
  if (merged.page && Number(merged.page) > 1) search.set("page", merged.page);
  const qs = search.toString();
  return qs ? `/admin/inventory?${qs}` : "/admin/inventory";
}

export function inventoryStatusView(status?: string) {
  if (status === "all" || INVENTORY_STATUSES.includes(status as (typeof INVENTORY_STATUSES)[number])) {
    return status;
  }
  return "live";
}

export function InventoryDesk({
  params,
  lot,
  vehicles,
  total,
}: {
  params: InventoryParams;
  lot: InventoryLotRow[];
  vehicles: InventoryVehicle[];
  total: number;
}) {
  const live = lot.filter((row) => row.status === "in_stock" || row.status === "in_transit");
  const inStock = lot.filter((row) => row.status === "in_stock");
  const inTransit = lot.filter((row) => row.status === "in_transit");
  const aged = inStock.filter((row) => daysOnLot(row.created_at) >= 60);
  const ford = live.filter((row) => row.brand === "ford");
  const lincoln = live.filter((row) => row.brand === "lincoln");
  const lotValue = live.reduce((sum, row) => sum + Number(row.internet_price ?? row.msrp ?? 0), 0);
  const status = inventoryStatusView(params.status);
  const agedOn = params.aged === "1";
  const liveOn = !agedOn && status === "live";
  const page = Math.max(1, Number(params.page) || 1);
  const pages = Math.max(1, Math.ceil(total / INVENTORY_PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * INVENTORY_PAGE_SIZE + 1;
  const to = Math.min(page * INVENTORY_PAGE_SIZE, total);
  const fordShare = live.length ? Math.round((ford.length / live.length) * 1000) / 10 : 0;

  return (
    <div className="space-y-3">
      <section className="overflow-hidden border border-ford bg-ford px-4 py-3 text-white">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Live lot value</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-lincoln-gold-bright">{formatUsd(lotValue)}</p>
            <p className="mt-1 text-[11px] text-white/60">
              {live.length} units · {ford.length} Ford · {lincoln.length} Lincoln
            </p>
          </div>
          <div className="min-w-[12rem] flex-1 sm:max-w-xs">
            <div className="flex h-2 overflow-hidden bg-white/15">
              <div className="h-full bg-white" style={{ width: `${fordShare}%` }} />
              <div className="h-full bg-lincoln-gold-bright" style={{ width: `${Math.max(0, 100 - fordShare)}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wide text-white/55">
              <span>Ford {fordShare}%</span>
              <span>Lincoln {Math.round((100 - fordShare) * 10) / 10}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden border border-chrome bg-chrome sm:grid-cols-3 lg:grid-cols-6" aria-label="Lot filters">
        <Kpi href={inventoryHref(params, { status: "live", aged: undefined })} label="Live" value={String(live.length)} hint="On lot + inbound" active={liveOn} />
        <Kpi href={inventoryHref(params, { status: "in_stock", aged: undefined })} label="In stock" value={String(inStock.length)} hint="Ready to show" active={!agedOn && status === "in_stock"} />
        <Kpi href={inventoryHref(params, { status: "in_transit", aged: undefined })} label="In transit" value={String(inTransit.length)} hint="Inbound" active={!agedOn && status === "in_transit"} />
        <Kpi href={inventoryHref(params, { aged: agedOn ? undefined : "1", status: undefined })} label="Aged 60+" value={String(aged.length)} hint="Needs a move" active={agedOn} alert={aged.length > 0} />
        <Kpi href={inventoryHref(params, { brand: params.brand === "ford" ? undefined : "ford" })} label="Ford" value={String(ford.length)} hint="Live units" active={params.brand === "ford"} />
        <Kpi href={inventoryHref(params, { brand: params.brand === "lincoln" ? undefined : "lincoln" })} label="Lincoln" value={String(lincoln.length)} hint="Live units" active={params.brand === "lincoln"} />
      </section>

      <AdminPanel>
        <div className="flex flex-col gap-3 border-b border-chrome px-3 py-3 md:flex-row md:items-center">
          <InventoryDeskSearch params={params} catalog={lot} />
          <Link
            href="/admin/inventory/new"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 bg-ford px-3 text-sm font-medium text-white hover:bg-ford-bright"
          >
            <Plus className="size-3.5" />
            Add vehicle
          </Link>
        </div>

        <div className="space-y-2.5 border-b border-chrome px-3 py-3">
          <FilterRail label="Brand">
            <FilterChip href={inventoryHref(params, { brand: undefined })} active={!params.brand}>
              All
            </FilterChip>
            <FilterChip href={inventoryHref(params, { brand: "ford" })} active={params.brand === "ford"}>
              Ford
            </FilterChip>
            <FilterChip href={inventoryHref(params, { brand: "lincoln" })} active={params.brand === "lincoln"}>
              Lincoln
            </FilterChip>
          </FilterRail>
          <FilterRail label="Condition">
            <FilterChip href={inventoryHref(params, { condition: undefined })} active={!params.condition}>
              Any
            </FilterChip>
            <FilterChip href={inventoryHref(params, { condition: "new" })} active={params.condition === "new"}>
              New
            </FilterChip>
            <FilterChip href={inventoryHref(params, { condition: "used" })} active={params.condition === "used"}>
              Used
            </FilterChip>
            <FilterChip href={inventoryHref(params, { condition: "cpo" })} active={params.condition === "cpo"}>
              CPO
            </FilterChip>
          </FilterRail>
          <FilterRail label="Status">
            <FilterChip href={inventoryHref(params, { status: "live", aged: undefined })} active={liveOn}>
              Live
            </FilterChip>
            {INVENTORY_STATUSES.map((value) => (
              <FilterChip key={value} href={inventoryHref(params, { status: value, aged: undefined })} active={!agedOn && status === value}>
                {titleCase(value)}
              </FilterChip>
            ))}
            <FilterChip href={inventoryHref(params, { status: "all", aged: undefined })} active={!agedOn && status === "all"}>
              All
            </FilterChip>
          </FilterRail>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">
            {total === 0 ? "No matching vehicles" : `Showing ${from}–${to} of ${total}`}
            {params.q ? ` for “${params.q.trim()}”` : agedOn ? " · aged 60+ days" : liveOn ? " · live lot" : null}
          </p>
          {pages > 1 ? <p className="text-[11px] tabular-nums text-muted-foreground">Page {page} of {pages}</p> : null}
        </div>

        {vehicles.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">No matching vehicles. Clear a filter or add a unit.</p>
        ) : (
          <ul className="divide-y divide-chrome/70 border-t border-chrome">
            {vehicles.map((row) => (
              <VehicleRow key={row.id} row={row} />
            ))}
          </ul>
        )}

        {pages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-chrome px-3 py-2.5">
            <Link
              href={inventoryHref(params, { page: page > 2 ? String(page - 1) : undefined })}
              className={cn(
                "inline-flex h-8 items-center gap-1 border px-2.5 text-xs font-medium",
                page <= 1 ? "pointer-events-none border-chrome text-muted-foreground/50" : "border-chrome hover:border-ford hover:text-ford",
              )}
              aria-disabled={page <= 1}
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Link>
            <p className="text-[11px] tabular-nums text-muted-foreground">
              {from}–{to} / {total}
            </p>
            <Link
              href={inventoryHref(params, { page: page < pages ? String(page + 1) : String(page) })}
              className={cn(
                "inline-flex h-8 items-center gap-1 border px-2.5 text-xs font-medium",
                page >= pages ? "pointer-events-none border-chrome text-muted-foreground/50" : "border-chrome hover:border-ford hover:text-ford",
              )}
              aria-disabled={page >= pages}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        ) : null}
      </AdminPanel>
    </div>
  );
}

function VehicleRow({ row }: { row: InventoryVehicle }) {
  const photo = firstPhoto(row.vehicle_images);
  const days = daysOnLot(row.created_at);
  const callForPrice = vehicleCallForPrice(row);
  const price = listingPrice(row);
  const stored = row.internet_price ?? row.msrp;
  const msrp = row.msrp;
  const ford = row.brand === "ford";
  const lincoln = row.brand === "lincoln";
  const title = [row.year, row.make, row.model].filter(Boolean).join(" ") || "Vehicle";
  const meta = [row.trim, row.exterior_color, row.mileage != null ? `${row.mileage.toLocaleString("en-US")} mi` : null]
    .filter(Boolean)
    .join(" · ");
  const agePct = Math.min(100, Math.round((days / 90) * 100));

  return (
    <li style={{ contentVisibility: "auto", containIntrinsicSize: "auto 88px" }}>
      <Link href={`/admin/inventory/${row.id}`} className="flex gap-3 px-3 py-2.5 hover:bg-[#f7f8fa]">
        <span
          className={cn("w-1 shrink-0 self-stretch", ford ? "bg-ford" : lincoln ? "bg-lincoln-gold" : "bg-[#c5ccd3]")}
          aria-hidden
        />
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-16 w-[5.5rem] shrink-0 object-cover" />
        ) : (
          <span
            className={cn(
              "flex h-16 w-[5.5rem] shrink-0 items-center justify-center text-xs font-bold",
              ford ? "bg-ford text-white" : lincoln ? "bg-lincoln-gold text-lincoln" : "bg-[#eef1f4] text-muted-foreground",
            )}
          >
            {ford ? "F" : lincoln ? "L" : "—"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta || (row.vin ?? "No VIN")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">{callForPrice ? "Call for price" : formatUsd(price)}</p>
              {callForPrice && stored != null ? (
                <p className="text-[10px] tabular-nums text-muted-foreground">{formatUsd(Number(stored))} on file</p>
              ) : msrp != null && row.internet_price != null && msrp > row.internet_price ? (
                <p className="text-[10px] tabular-nums text-muted-foreground line-through">{formatUsd(msrp)}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="border border-chrome bg-white px-1.5 py-0.5 font-mono text-[10px] tabular-nums">
              {row.stock_number ?? "No stock"}
            </span>
            <span className={cn("px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", STATUS_TONE[row.status] ?? STATUS_TONE.hidden)}>
              {titleCase(row.status)}
            </span>
            {row.condition ? (
              <span className="bg-[#eef1f4] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {titleCase(row.condition)}
              </span>
            ) : null}
            <span className={cn("ml-auto flex min-w-[6.5rem] items-center gap-2 text-[11px] tabular-nums", days >= 60 && "font-semibold text-ford")}>
              <span className="w-8 text-right">{days}d</span>
              <span className="h-1 flex-1 bg-[#eef1f4]">
                <span className={cn("block h-full", days >= 60 ? "bg-ford" : "bg-ford-bright")} style={{ width: `${Math.max(days ? 8 : 0, agePct)}%` }} />
              </span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function FilterRail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-7 items-center border px-2.5 text-[12px] font-medium",
        active ? "border-ford bg-ford text-white" : "border-chrome bg-white text-foreground hover:border-ford hover:text-ford",
      )}
    >
      {children}
    </Link>
  );
}

function Kpi({
  href,
  label,
  value,
  hint,
  active,
  alert,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  active?: boolean;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-white px-3 py-2.5 hover:bg-[#f7f8fa]",
        active && "bg-[#eef4fb]",
        alert && !active && "bg-red-50/80",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums leading-none", alert && "text-ford")}>{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </Link>
  );
}
