import Link from "next/link";
import { LEAD_HAPPY_PATH, LEAD_STAGE_META } from "@/lib/admin/lead-pipeline";
import { formatPct } from "@/lib/admin/ad-campaigns";
import type { AnalyticsSnapshot } from "@/lib/admin/analytics";
import { AdminPanel } from "@/components/admin/admin-panel";
import { cn } from "@/lib/utils";

export function AnalyticsDesk({ data }: { data: AnalyticsSnapshot }) {
  const typeMax = Math.max(...data.types.map((row) => row.count), 1);
  const brandTotal = data.brands.reduce((sum, row) => sum + row.count, 0) || 1;
  const sourceMax = Math.max(...data.sources.map((row) => row.count), 1);
  const pulseMax = Math.max(...data.pulse.map((row) => row.count), 1);
  const fordShare = Math.round((data.brands[0]!.count / brandTotal) * 1000) / 10;
  const lincolnShare = Math.round((data.brands[1]!.count / brandTotal) * 1000) / 10;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-px overflow-hidden border border-chrome bg-chrome sm:grid-cols-3 lg:grid-cols-6" aria-label="Lead totals">
        <Stat href="/admin/leads" label="Leads" value={String(data.total)} hint="All time" />
        <Stat href="/admin/leads" label="Open" value={String(data.open)} hint="In motion" accent={data.open > 0} />
        <Stat href="/admin/leads?stage=sold" label="Sold" value={String(data.sold)} hint="Closed won" />
        <Stat href="/admin/leads?stage=lost" label="Lost" value={String(data.lost)} hint="Off-path" />
        <Stat href="/admin/leads" label="Win rate" value={formatPct(data.winRate)} hint="Sold ÷ closed" />
        <Stat href="/admin/inbox" label="This week" value={String(data.thisWeek)} hint="New in 7 days" />
      </section>

      <AdminPanel>
        <div className="flex items-end justify-between gap-3 border-b border-chrome px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Funnel</p>
            <h2 className="text-sm font-semibold tracking-tight">Inquiry to sold</h2>
          </div>
          <Link href="/admin/leads" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-ford">
            Board
          </Link>
        </div>
        <div className="px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-stretch">
            {LEAD_HAPPY_PATH.map((stage, index) => {
              const meta = LEAD_STAGE_META[stage];
              const row = data.stages.find((item) => item.stage === stage)!;
              const conversion = data.conversions[index];
              return (
                <div key={stage} className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-stretch">
                  <Link
                    href={`/admin/leads?stage=${stage}`}
                    className={cn(
                      "flex min-h-20 flex-1 flex-col justify-center px-3 py-3",
                      stage === "appointment" ? "text-lincoln" : "text-white",
                    )}
                    style={{ backgroundColor: row.color }}
                  >
                    <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", stage === "appointment" ? "text-lincoln/70" : "text-white/80")}>
                      {meta.label}
                    </p>
                    <p className="text-2xl font-semibold tabular-nums tracking-tight lg:text-3xl">{row.count}</p>
                    <p className={cn("text-[11px]", stage === "appointment" ? "text-lincoln/70" : "text-white/75")}>{meta.hint}</p>
                  </Link>
                  {conversion ? (
                    <div className="flex items-center justify-center bg-white px-1 py-1 lg:min-w-12 lg:flex-col">
                      <span className="bg-[#eef1f4] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">{formatPct(conversion.rate)}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden bg-[#eef1f4]" aria-hidden>
            {data.stages.map((row) => (
              <div
                key={row.stage}
                className="min-w-0"
                style={{
                  width: data.total ? `${(row.count / data.total) * 100}%` : `${100 / data.stages.length}%`,
                  backgroundColor: row.color,
                  minWidth: row.count > 0 ? 3 : 0,
                }}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {data.lost > 0 ? `${data.lost} lost off-path · ` : null}
            Conversion chips are stage-to-stage from current counts.
          </p>
        </div>
      </AdminPanel>

      <section className="grid gap-3 lg:grid-cols-12">
        <AdminPanel className="lg:col-span-7">
          <div className="border-b border-chrome px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Intake</p>
            <h2 className="text-sm font-semibold tracking-tight">Leads added · 30 days</h2>
          </div>
          <div className="px-4 py-3">
            <svg viewBox="0 0 640 160" className="h-40 w-full" role="img" aria-label="Leads added over the last 30 days">
              {data.pulse.map((point, index) => {
                const slot = 640 / data.pulse.length;
                const barW = Math.max(6, slot * 0.62);
                const height = point.count > 0 ? Math.max(6, (point.count / pulseMax) * 120) : 2;
                return (
                  <rect
                    key={point.date}
                    x={index * slot + (slot - barW) / 2}
                    y={128 - height}
                    width={barW}
                    height={height}
                    fill={point.count > 0 ? "#003478" : "#eef1f4"}
                  >
                    <title>{`${point.label}: ${point.count}`}</title>
                  </rect>
                );
              })}
              {[0, Math.floor(data.pulse.length / 2), data.pulse.length - 1].map((index) => {
                const point = data.pulse[index];
                if (!point) return null;
                const slot = 640 / data.pulse.length;
                return (
                  <text key={point.date} x={index * slot + slot / 2} y={152} textAnchor="middle" fill="#5b6570" fontSize="10">
                    {point.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </AdminPanel>
        <AdminPanel className="lg:col-span-5">
          <div className="border-b border-chrome px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mix</p>
            <h2 className="text-sm font-semibold tracking-tight">Ford vs Lincoln</h2>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-4">
              <div
                className="relative size-24 shrink-0 rounded-full"
                style={{
                  background:
                    brandTotal > 0
                      ? `conic-gradient(#003478 0% ${fordShare}%, #edcf8c ${fordShare}% ${fordShare + lincolnShare}%, #9aa3ad ${fordShare + lincolnShare}% 100%)`
                      : "#e5e7eb",
                }}
                role="img"
                aria-label={`Ford ${fordShare} percent, Lincoln ${lincolnShare} percent`}
              >
                <span className="absolute inset-[18%] rounded-full bg-white" />
              </div>
              <ul className="min-w-0 flex-1 space-y-2">
                {data.brands.map((row) => (
                  <li key={row.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ backgroundColor: row.color }} />
                        {row.label}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{row.count}</span>
                    </div>
                    <div className="h-1.5 bg-[#eef1f4]">
                      <div className="h-full" style={{ width: `${(row.count / brandTotal) * 100}%`, backgroundColor: row.color }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AdminPanel>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <AdminPanel>
          <div className="border-b border-chrome px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight">By type</h2>
          </div>
          <ul className="divide-y divide-chrome/70">
            {data.types.map((row) => (
              <li key={row.id}>
                <Link href={row.href} className="block px-4 py-3 hover:bg-[#f7f8fa]">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">{row.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#eef1f4]">
                    <div className="h-full" style={{ width: `${row.count > 0 ? Math.max(6, (row.count / typeMax) * 100) : 0}%`, backgroundColor: row.color }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </AdminPanel>
        <AdminPanel>
          <div className="border-b border-chrome px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight">By source</h2>
          </div>
          {data.sources.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No source data yet.</p>
          ) : (
            <ul className="divide-y divide-chrome/70">
              {data.sources.map((row) => (
                <li key={row.label} className="px-4 py-3">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">{row.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#eef1f4]">
                    <div className="h-full bg-ford" style={{ width: `${Math.max(6, (row.count / sourceMax) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </section>
    </div>
  );
}

function Stat({
  href,
  label,
  value,
  hint,
  accent,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <Link href={href} className={cn("bg-white px-3 py-3 hover:bg-[#f7f8fa]", accent && "bg-[#eef4fb]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </Link>
  );
}
