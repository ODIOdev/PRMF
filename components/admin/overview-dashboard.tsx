import Link from "next/link";
import {
  Calendar,
  Columns3,
  ListTodo,
  Mail,
  Truck,
  Warehouse,
} from "lucide-react";
import { formatUsd, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  LEAD_STAGE_COLORS,
  leadName,
  type OverviewSnapshot,
} from "@/lib/admin/overview";
import { LotPulseChart } from "@/components/admin/lot-pulse-chart";

export function OverviewDashboard({ data }: { data: OverviewSnapshot }) {
  const live = data.inStock + data.inTransit;
  const agingMax = Math.max(...data.aging.map((bucket) => bucket.count), 1);
  const modelMax = Math.max(...data.topModels.map((row) => row.count), 1);
  const conditionTotal = data.byCondition.new + data.byCondition.used + data.byCondition.cpo || 1;
  const stageTotal = data.stageCounts.reduce((sum, row) => sum + row.count, 0);
  const fordSharePct = Math.round(data.fordShare * 1000) / 10;
  const lincolnSharePct = Math.round((1 - data.fordShare) * 1000) / 10;

  return (
    <div className="space-y-3">
      <section className="space-y-2" aria-label="Overview metrics">
        <div className="grid gap-2 lg:grid-cols-12">
          <Link
            href="/admin/inventory"
            className="group relative isolate overflow-hidden border border-ford bg-ford px-4 py-3 text-white lg:col-span-4"
          >
            <span className="pointer-events-none absolute -top-8 -right-6 size-28 rounded-full bg-lincoln-gold/40 blur-2xl" aria-hidden />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">Lot value</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums leading-none tracking-tight text-lincoln-gold-bright">
                  {formatUsd(data.lotValue)}
                </p>
                <p className="mt-1.5 text-[11px] text-white/55">
                  {live} live units · Open inventory
                </p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center bg-lincoln-gold text-sm font-bold text-lincoln">
                $
              </span>
            </div>
          </Link>
          <div className="grid grid-cols-3 gap-2 lg:col-span-8">
            <PrimaryKpi href="/admin/inventory?status=in_stock" label="In stock" value={String(data.inStock)} hint={`${data.avgDays} day avg on lot`} icon={Warehouse} />
            <PrimaryKpi href="/admin/inventory?status=in_transit" label="In transit" value={String(data.inTransit)} hint="Inbound to Brooklyn" icon={Truck} highlight />
            <PrimaryKpi href="/admin/leads" label="Open deals" value={String(data.openDeals)} hint={`${data.newLeads.length} new in inbox`} icon={Columns3} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-px overflow-hidden border border-chrome bg-chrome sm:grid-cols-6">
          <OpsChip href="/admin/inventory" label="Aged 60+" value={String(data.aged)} alert={data.aged > 0} icon={Warehouse} />
          <OpsChip href="/admin/tasks" label="Tasks" value={String(data.openTasks)} alert={data.openTasks > 0} icon={ListTodo} />
          <OpsChip href="/admin/appointments" label="Today" value={String(data.todayAppointments.length)} icon={Calendar} />
          <OpsChip href="/admin/inbox" label="New leads" value={String(data.newLeads.length)} alert={data.newLeads.length > 0} icon={Mail} />
          <OpsChip href="/admin/inventory?brand=ford" label="Ford" value={String(data.ford)} />
          <OpsChip href="/admin/inventory?brand=lincoln" label="Lincoln" value={String(data.lincoln)} />
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-12">
        <Panel title="Lot pulse" caption="Arrivals, quiet days, and the live lot · last 30 days" action={{ href: "/admin/inventory", label: "Inventory" }} className="lg:col-span-8">
          <LotPulseChart
            points={data.pulse}
            live={{ ford: data.ford, lincoln: data.lincoln, value: data.lotValue }}
          />
        </Panel>
        <Panel title="Pipeline" caption={`${stageTotal} leads`} action={{ href: "/admin/leads", label: "Board" }} className="lg:col-span-4">
          <div className="flex flex-col gap-3 px-3 py-3">
            <div className="grid grid-cols-3 gap-1.5">
              <MiniMetric label="Open" value={data.openDeals} tone={data.openDeals > 0 ? "text-ford" : undefined} />
              <MiniMetric label="Sold" value={data.stageCounts.find((row) => row.stage === "sold")?.count ?? 0} />
              <MiniMetric label="Lost" value={data.stageCounts.find((row) => row.stage === "lost")?.count ?? 0} />
            </div>
            <div className="flex h-2.5 overflow-hidden bg-[#eef1f4]" role="img" aria-label="Lead stage mix">
              {data.stageCounts.filter((row) => row.count > 0).map((row) => (
                <span
                  key={row.stage}
                  title={`${titleCase(row.stage)} · ${row.count}`}
                  className="min-w-[3px]"
                  style={{
                    width: `${stageTotal ? (row.count / stageTotal) * 100 : 0}%`,
                    backgroundColor: LEAD_STAGE_COLORS[row.stage],
                  }}
                />
              ))}
            </div>
            <ul className="space-y-1.5">
              {data.stageCounts.map((row) => {
                const pct = stageTotal ? Math.round((row.count / stageTotal) * 100) : 0;
                return (
                  <li key={row.stage}>
                    <Link href="/admin/leads" className="group block border border-chrome/80 bg-[#f7f8fa] px-2.5 py-2 hover:border-ford/40 hover:bg-white">
                      <div className="flex items-center gap-2">
                        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: LEAD_STAGE_COLORS[row.stage] }} />
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">{titleCase(row.stage)}</span>
                        <span className="text-[10px] tabular-nums text-muted-foreground">{pct}%</span>
                        <span className="min-w-[1.25rem] text-right text-sm font-semibold tabular-nums">{row.count}</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden bg-white">
                        <span className="block h-full" style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: LEAD_STAGE_COLORS[row.stage] }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <BrandCard
          href="/admin/inventory?brand=ford"
          eyebrow="Premier Ford"
          title="Ford on lot"
          units={data.ford}
          value={data.fordValue}
          share={fordSharePct}
          tone="ford"
          leading={data.fordValue >= data.lincolnValue && data.lotValue > 0}
        />
        <BrandCard
          href="/admin/inventory?brand=lincoln"
          eyebrow="Premier Lincoln"
          title="Lincoln on lot"
          units={data.lincoln}
          value={data.lincolnValue}
          share={lincolnSharePct}
          tone="lincoln"
          leading={data.lincolnValue > data.fordValue && data.lotValue > 0}
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Panel title="Brand mix" caption={`${formatUsd(data.lotValue)} live`}>
          <div className="px-3 py-3">
            <div className="flex items-center gap-4">
              <div
                className="relative size-20 shrink-0 rounded-full"
                style={{
                  background:
                    data.lotValue > 0
                      ? `conic-gradient(#003478 0% ${fordSharePct}%, var(--lincoln-gold) ${fordSharePct}% 100%)`
                      : "#e5e7eb",
                }}
                role="img"
                aria-label={`Ford ${fordSharePct} percent, Lincoln ${lincolnSharePct} percent of lot value`}
              >
                <span className="absolute inset-[18%] rounded-full bg-white" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <CompareRow label="Units" left={data.ford} right={data.lincoln} />
                <CompareRow label="Lot value" left={data.fordValue} right={data.lincolnValue} money />
              </div>
            </div>
            <div className="mt-4 flex h-2.5 overflow-hidden bg-[#eef1f4]">
              <div className="h-full bg-ford" style={{ width: `${fordSharePct}%` }} />
              <div className="h-full bg-lincoln-gold" style={{ width: `${Math.max(0, 100 - fordSharePct)}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-ford" /> Ford {fordSharePct}%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-lincoln-gold" /> Lincoln {lincolnSharePct}%
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5">
              <MiniMetric label="New" value={data.byCondition.new} />
              <MiniMetric label="Used" value={data.byCondition.used} />
              <MiniMetric label="CPO" value={data.byCondition.cpo} />
            </div>
            <div className="mt-2 flex h-2 overflow-hidden bg-[#eef1f4]">
              <div className="h-full bg-ford" style={{ width: `${(data.byCondition.new / conditionTotal) * 100}%` }} />
              <div className="h-full bg-ford-bright" style={{ width: `${(data.byCondition.used / conditionTotal) * 100}%` }} />
              <div className="h-full bg-lincoln-gold" style={{ width: `${(data.byCondition.cpo / conditionTotal) * 100}%` }} />
            </div>
          </div>
        </Panel>
        <Panel title="Aging" caption="In-stock days on lot">
          <div className="px-3 py-3">
            <ul className="space-y-2.5">
              {data.aging.map((bucket) => {
                const pct = Math.round((bucket.count / agingMax) * 100);
                const hot = bucket.min >= 61;
                return (
                  <li key={bucket.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className={hot ? "font-medium text-ford" : ""}>{bucket.label}</span>
                      <span className="tabular-nums text-muted-foreground">{bucket.count}</span>
                    </div>
                    <div className="h-2 bg-[#eef1f4]">
                      <div className={cn("h-full", hot ? "bg-ford" : "bg-ford-bright")} style={{ width: `${Math.max(pct, bucket.count ? 4 : 0)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>
      </section>

      <section className="grid gap-3 lg:grid-cols-12">
        <Panel title="Top models" caption="Live units" action={{ href: "/admin/inventory", label: "All" }} className="lg:col-span-5">
          <ul className="divide-y divide-chrome/70">
            {data.topModels.map((row, index) => (
              <li key={`${row.brand}-${row.name}`} className="flex items-center gap-3 px-3 py-2.5">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center text-[10px] font-bold",
                    index === 0 ? "bg-lincoln-gold text-lincoln" : "bg-[#eef1f4] text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{row.name}</p>
                  <div className="mt-1 h-1 overflow-hidden bg-[#eef1f4]">
                    <div
                      className={row.brand === "lincoln" ? "h-full bg-lincoln-gold" : "h-full bg-ford"}
                      style={{ width: `${Math.max((row.count / modelMax) * 100, 6)}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold tabular-nums">{row.count}</p>
                  <p className="text-[10px] tabular-nums text-muted-foreground">{formatUsd(row.value)}</p>
                </div>
              </li>
            ))}
            {data.topModels.length === 0 ? <EmptyRow>No live units.</EmptyRow> : null}
          </ul>
        </Panel>
        <Panel title="Attention" caption="New web leads" action={{ href: "/admin/inbox", label: "Inbox" }} className="lg:col-span-4">
          <ul className="divide-y divide-chrome/70">
            {data.newLeads.map((lead) => (
              <li key={lead.id}>
                <Link href={`/admin/leads/${lead.id}`} className="flex items-baseline justify-between gap-3 px-3 py-2.5 hover:bg-[#f7f8fa]">
                  <span className="min-w-0 truncate text-xs font-medium">{leadName(lead)}</span>
                  <span className="shrink-0 capitalize text-[10px] text-muted-foreground">{lead.type}</span>
                </Link>
              </li>
            ))}
            {data.newLeads.length === 0 ? <EmptyRow>No new web leads.</EmptyRow> : null}
          </ul>
        </Panel>
        <div className="grid gap-3 lg:col-span-3">
          <Panel title="Aged units" caption={`${data.aged} over 60 days`} action={{ href: "/admin/inventory", label: "Lot" }}>
            <ul className="divide-y divide-chrome/70">
              {data.agedUnits.map((row) => (
                <li key={row.id}>
                  <Link href={`/admin/inventory/${row.id}`} className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-[#f7f8fa]">
                    <span className="min-w-0 truncate text-xs">{row.name}</span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-ford">{row.days}d</span>
                  </Link>
                </li>
              ))}
              {data.agedUnits.length === 0 ? <EmptyRow>Stock is turning.</EmptyRow> : null}
            </ul>
          </Panel>
          <Panel title="Today" caption="Appointments" action={{ href: "/admin/appointments", label: "Desk" }}>
            <ul className="divide-y divide-chrome/70">
              {data.todayAppointments.map((row) => (
                <li key={row.id} className="flex items-baseline justify-between gap-2 px-3 py-2 text-xs">
                  <span className="capitalize">{row.type.replace("_", " ")}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {new Date(row.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                </li>
              ))}
              {data.todayAppointments.length === 0 ? <EmptyRow>No appointments today.</EmptyRow> : null}
            </ul>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Panel({
  title,
  caption,
  action,
  className,
  children,
}: {
  title: string;
  caption?: string;
  action?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("min-w-0 overflow-hidden border border-chrome bg-white", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-chrome px-3 py-2">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide">{title}</h2>
          {caption ? <p className="text-[10px] text-muted-foreground">{caption}</p> : null}
        </div>
        {action ? (
          <Link href={action.href} className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-ford">
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function PrimaryKpi({
  href,
  label,
  value,
  hint,
  icon: Icon,
  highlight = false,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 flex-col justify-between border px-3 py-2.5 transition hover:-translate-y-px",
        highlight ? "border-lincoln-gold/80 bg-[#fbf6e8]" : "border-chrome bg-white hover:bg-white",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className="flex size-6 items-center justify-center border border-chrome bg-[#f7f8fa]">
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>
    </Link>
  );
}

function OpsChip({
  href,
  label,
  value,
  icon: Icon,
  alert,
}: {
  href: string;
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
        className={cn("flex items-center gap-2.5 bg-white px-3 py-2.5 hover:bg-[#f7f8fa]", alert && "bg-red-50/80")}
    >
      {Icon ? (
        <span className={cn("flex size-7 shrink-0 items-center justify-center border border-chrome bg-[#f7f8fa]", alert && "border-red-200 bg-red-100 text-red-700")}>
          <Icon className="size-3.5" />
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={cn("block text-base font-semibold tabular-nums leading-none", alert && "text-red-700")}>{value}</span>
      </span>
    </Link>
  );
}

function MiniMetric({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="border border-chrome bg-[#f7f8fa] px-2 py-1.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold tabular-nums leading-none", tone)}>{value}</p>
    </div>
  );
}

function BrandCard({
  href,
  eyebrow,
  title,
  units,
  value,
  share,
  tone,
  leading,
}: {
  href: string;
  eyebrow: string;
  title: string;
  units: number;
  value: number;
  share: number;
  tone: "ford" | "lincoln";
  leading: boolean;
}) {
  const ford = tone === "ford";
  const accent = ford ? "#003478" : "#edcf8c";
  const avg = units > 0 ? value / units : 0;
  const ring = Math.max(0, Math.min(100, share));

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden border bg-white p-4 pl-5 transition hover:-translate-y-px hover:bg-[#fbfcfd]",
        ford ? "border-ford/25" : "border-lincoln-gold/55",
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: accent }} />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full blur-2xl"
        style={{ backgroundColor: ford ? "rgba(0,52,120,0.16)" : "rgba(237,207,140,0.55)" }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
          <h3 className="mt-0.5 text-sm font-semibold tracking-tight">{title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {leading ? (
            <span
              className={cn(
                "px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]",
                ford ? "bg-ford text-white" : "bg-lincoln-gold text-lincoln",
              )}
            >
              Lead
            </span>
          ) : null}
          <span
            className={cn(
              "flex h-9 shrink-0 items-center justify-center px-2",
              ford ? "bg-white ring-1 ring-ford/15" : "bg-lincoln-gold",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ford ? "/logos/ford-oval.svg" : "/logos/lincoln.svg"}
              alt=""
              className={ford ? "h-[18px] w-auto" : "h-6 w-auto"}
            />
          </span>
        </div>
      </div>

      <p className="relative mt-5 text-3xl font-semibold tabular-nums tracking-tight">{formatUsd(value)}</p>
      <p className="relative mt-1 text-[11px] text-muted-foreground">Live lot value</p>

      <div className="relative mt-5 flex items-end gap-5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Units</p>
          <p className="mt-1 text-[2rem] font-semibold tabular-nums leading-none tracking-tight">{units.toLocaleString("en-US")}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{avg > 0 ? `${formatUsd(avg)} avg` : "No live units"}</p>
          <div className={cn("mt-3 h-1.5", ford ? "bg-ford/15" : "bg-lincoln-gold/25")} aria-hidden>
            <div className="h-full" style={{ width: `${ring}%`, backgroundColor: accent }} />
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div className="relative size-[4.5rem]" role="img" aria-label={`${share}% of lot value`}>
            <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r="14.5" fill="none" stroke="#eef1f4" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="14.5"
                fill="none"
                stroke={accent}
                strokeWidth="3.5"
                strokeLinecap="butt"
                pathLength={100}
                strokeDasharray={`${ring} ${100 - ring}`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">{share}%</span>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Share</p>
        </div>
      </div>
    </Link>
  );
}

function CompareRow({ label, left, right, money }: { label: string; left: number; right: number; money?: boolean }) {
  const max = Math.max(left, right, 1);
  const render = (value: number) => (money ? formatUsd(value) : String(value));
  const fill = (part: number) => `${Math.max(4, Math.round((part / max) * 100))}%`;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-[11px] tabular-nums text-muted-foreground">
          <span className="font-semibold text-ford">{render(left)}</span>
          {" vs "}
          <span className="font-semibold text-[#c49a3d]">{render(right)}</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-2 overflow-hidden bg-ford/15">
          <div className="h-full bg-ford" style={{ width: fill(left) }} />
        </div>
        <div className="h-2 overflow-hidden bg-lincoln-gold/25">
          <div className="h-full bg-lincoln-gold" style={{ width: fill(right) }} />
        </div>
      </div>
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <li className="px-3 py-4 text-center text-xs text-muted-foreground">{children}</li>;
}
