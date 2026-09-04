import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  ChevronRight,
  CircleSlash,
  FileText,
  Inbox,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { updateLeadStage } from "@/app/admin/(staff)/crm-actions";
import {
  LEAD_HAPPY_PATH,
  LEAD_STAGE_META,
  buildLeadPipeline,
  leadCustomer,
  leadDisplayName,
  type PipelineLead,
} from "@/lib/admin/lead-pipeline";
import { LEAD_STAGE_COLORS, LEAD_STAGES } from "@/lib/admin/overview";
import { titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LeadStage } from "@/lib/types";

const STAGE_ICONS: Record<LeadStage, LucideIcon> = {
  new: Inbox,
  contacted: Phone,
  appointment: Calendar,
  proposal: FileText,
  sold: BadgeCheck,
  lost: CircleSlash,
};

const STAGE_TONE: Record<LeadStage, string> = {
  new: "bg-[#dbe7f5] text-ford",
  contacted: "bg-[#d7eef8] text-[#0f5f8a]",
  appointment: "bg-[#f7edd4] text-[#8a6a22]",
  proposal: "bg-[#e4ebf2] text-[#3d556c]",
  sold: "bg-emerald-100 text-emerald-800",
  lost: "bg-[#eceff2] text-[#5b6570]",
};

function formatPct(rate: number | null) {
  if (rate == null) return "—";
  return `${Math.round(rate * 100)}%`;
}

function ageLabel(iso: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function LeadPipelineBoard({
  leads,
  activeStage,
}: {
  leads: PipelineLead[];
  activeStage?: string;
}) {
  const data = buildLeadPipeline(leads, activeStage);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-px overflow-hidden border border-chrome bg-chrome sm:grid-cols-5" aria-label="Pipeline totals">
        <Kpi label="Open" value={String(data.open)} hint="Still in motion" accent={data.open > 0} />
        <Kpi label="Sold" value={String(data.sold)} hint="Closed won" />
        <Kpi label="Lost" value={String(data.lost)} hint="Off-path" />
        <Kpi label="Win rate" value={formatPct(data.winRate)} hint="Sold ÷ closed" />
        <Kpi label="This week" value={String(data.thisWeek)} hint="New in 7 days" className="col-span-2 sm:col-span-1" />
      </section>

      <section className="space-y-3" aria-label="Deal workflow">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">Showroom pipeline</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {data.open > 0
                ? `${data.open} deal${data.open === 1 ? "" : "s"} still moving · ${data.total} total`
                : data.total > 0
                  ? "No open deals — board is clear"
                  : "No deals on the board yet"}
            </p>
          </div>
          <Link href="/admin/leads" className={cn("text-xs font-semibold uppercase tracking-wide", data.active === "all" ? "text-foreground" : "text-muted-foreground hover:text-ford")}>
            View all
          </Link>
        </div>

        <div className="hidden md:block">
          <div className="relative">
            <div className="pointer-events-none absolute top-[1.85rem] right-6 left-6 h-0.5 bg-chrome" aria-hidden />
            <ol className="relative grid grid-cols-5 gap-2">
              {LEAD_HAPPY_PATH.map((stage, index) => {
                const Icon = STAGE_ICONS[stage];
                const count = data.counts[stage];
                const active = data.active === stage;
                const meta = LEAD_STAGE_META[stage];
                return (
                  <li key={stage} className="min-w-0">
                    <Link
                      href={`/admin/leads?stage=${stage}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex flex-col items-center border bg-white px-2 py-3 text-center transition-colors",
                        active ? "border-lincoln-gold ring-1 ring-lincoln-gold" : "border-chrome hover:border-ford/40",
                      )}
                    >
                      <span className={cn("relative z-10 flex size-9 items-center justify-center border-2 border-white", STAGE_TONE[stage])}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide">{meta.label}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{meta.description}</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums">{count}</p>
                      {index < LEAD_HAPPY_PATH.length - 1 ? (
                        <ChevronRight className="pointer-events-none absolute top-[1.35rem] -right-3 z-10 hidden size-4 text-muted-foreground/50 lg:block" aria-hidden />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
          <FlowMeter data={data} className="mt-3" />
        </div>

        <div className="grid gap-1.5 md:hidden">
          {LEAD_HAPPY_PATH.map((stage) => (
            <StageRow key={stage} stage={stage} count={data.counts[stage]} active={data.active === stage} max={Math.max(...LEAD_HAPPY_PATH.map((item) => data.counts[item]), 1)} />
          ))}
          <FlowMeter data={data} />
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)]">
          <div className="relative overflow-hidden border border-lincoln-gold/40 bg-[linear-gradient(135deg,#eef4fb_0%,#ffffff_48%,#fbf6e8_100%)]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 140% at 0% 40%, rgba(0,52,120,0.12), transparent 55%), radial-gradient(70% 120% at 100% 0%, rgba(237,207,140,0.28), transparent 52%)",
              }}
              aria-hidden
            />
            <div className="relative px-4 py-3.5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wide">Inquiry to sold</p>
                <p className="max-w-[17rem] text-right text-[11px] leading-snug text-muted-foreground">
                  Stay on this rail unless the deal is marked lost.
                </p>
              </div>
              <div className="relative pt-1">
                <div className="pointer-events-none absolute top-[18px] right-[10%] left-[10%] h-[2px] bg-chrome" aria-hidden />
                <div
                  className="pointer-events-none absolute top-[18px] left-[10%] h-[2px] bg-linear-to-r from-ford via-ford-bright to-lincoln-gold transition-[width] duration-700"
                  style={{ width: `${data.railPct}%` }}
                  aria-hidden
                />
                <ol className="relative grid grid-cols-5 gap-1">
                  {LEAD_HAPPY_PATH.map((stage, index) => {
                    const Icon = STAGE_ICONS[stage];
                    const count = data.counts[stage];
                    const active = data.active === stage;
                    const lit = count > 0 || active;
                    const conversion = data.conversions[index];
                    return (
                      <li key={stage} className="min-w-0">
                        <Link
                          href={`/admin/leads?stage=${stage}`}
                          aria-current={active ? "page" : undefined}
                          className="group flex flex-col items-center text-center"
                        >
                          <span
                            className={cn(
                              "relative z-10 flex size-9 items-center justify-center border-2 transition-transform group-hover:scale-105",
                              lit
                                ? "border-lincoln-gold bg-lincoln-gold text-lincoln shadow-[0_0_0_4px_rgba(237,207,140,0.28)]"
                                : "border-chrome bg-white text-muted-foreground group-hover:border-ford/40 group-hover:text-ford",
                              active && "ring-2 ring-ford/20 ring-offset-2 ring-offset-[#eef4fb]",
                            )}
                          >
                            <Icon className="size-3.5" aria-hidden />
                          </span>
                          <span className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide">{LEAD_STAGE_META[stage].short}</span>
                          <span className={cn("mt-1 text-lg font-semibold tabular-nums leading-none", lit ? "text-ford" : "text-muted-foreground/40")}>
                            {count}
                          </span>
                          {conversion ? (
                            <span className="mt-1 rounded-sm bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                              {formatPct(conversion.rate)}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>

          <Link
            href="/admin/leads?stage=lost"
            aria-current={data.active === "lost" ? "page" : undefined}
            className={cn(
              "relative flex min-h-0 flex-col overflow-hidden border transition-all",
              "bg-[linear-gradient(160deg,#f7f8fa_0%,#ffffff_52%,#eef1f4_100%)]",
              data.active === "lost" ? "border-lincoln-gold ring-1 ring-lincoln-gold" : "border-chrome hover:border-ford/40",
            )}
          >
            <div className="relative flex h-full flex-col gap-3 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex size-9 items-center justify-center bg-[#eceff2] text-[#5b6570] ring-4 ring-white">
                  <CircleSlash className="size-4" aria-hidden />
                </span>
                <span className="bg-white/85 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Off-path</span>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide">Lost</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">Deals that left the sold rail</p>
              </div>
              <div className="mt-auto flex items-end justify-between gap-2 border-t border-chrome pt-2.5">
                <div className="min-w-0 flex-1">
                  <div className="h-1.5 overflow-hidden bg-[#eef1f4]">
                    <div
                      className="h-full bg-[#9aa3ad]"
                      style={{ width: data.lost > 0 ? `${Math.min(100, 20 + data.lost * 10)}%` : "0%" }}
                    />
                  </div>
                </div>
                <p className="text-2xl font-semibold tabular-nums leading-none">{data.lost}</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="border border-chrome bg-white px-3 py-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Stage mix</p>
            <p className="text-[11px] text-muted-foreground">
              {data.types.sales} sales · {data.types.service} service
              {data.ford + data.lincoln > 0 ? ` · ${data.ford} Ford / ${data.lincoln} Lincoln` : ""}
            </p>
          </div>
          <div className="flex h-2.5 overflow-hidden bg-[#eef1f4]" role="img" aria-label="Lead stage mix">
            {data.total === 0 ? (
              <span className="block h-full w-full bg-chrome/60" />
            ) : (
              LEAD_STAGES.filter((stage) => data.counts[stage] > 0).map((stage) => (
                <Link
                  key={stage}
                  href={`/admin/leads?stage=${stage}`}
                  title={`${LEAD_STAGE_META[stage].label} · ${data.counts[stage]}`}
                  className="min-w-[3px]"
                  style={{
                    width: `${(data.counts[stage] / data.total) * 100}%`,
                    backgroundColor: LEAD_STAGE_COLORS[stage],
                  }}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" aria-label="Deal board">
        {data.columns.map((column) => {
          const Icon = STAGE_ICONS[column.stage];
          const active = data.active === column.stage;
          return (
            <section
              key={column.stage}
              className={cn("min-w-0 border bg-white", active ? "border-lincoln-gold ring-1 ring-lincoln-gold" : "border-chrome")}
            >
              <div className="flex items-center gap-1.5 border-b border-chrome px-2 py-1.5">
                <span className={cn("flex size-6 shrink-0 items-center justify-center", STAGE_TONE[column.stage])}>
                  <Icon className="size-3" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em]">{column.label}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums leading-none">{column.items.length}</span>
              </div>
              <div className="h-0.5" style={{ backgroundColor: column.color }} />
              <div className="space-y-1.5 p-1.5">
                {column.items.map((lead) => {
                  const customer = leadCustomer(lead);
                  return (
                    <article key={lead.id} className="border border-chrome/80 bg-[#f7f8fa] p-2">
                      <Link href={`/admin/leads/${lead.id}`} className="block truncate text-xs font-medium hover:text-ford">
                        {leadDisplayName(lead)}
                      </Link>
                      <p className="mt-0.5 truncate text-[10px] capitalize text-muted-foreground">
                        {lead.type ?? "lead"}
                        {lead.brand ? ` · ${lead.brand}` : ""}
                        {" · "}
                        {ageLabel(lead.created_at)}
                      </p>
                      {customer?.phone ? <p className="mt-0.5 truncate text-[10px] tabular-nums text-muted-foreground">{customer.phone}</p> : null}
                      <form action={updateLeadStage} className="mt-1.5 flex gap-1">
                        <input type="hidden" name="id" value={lead.id} />
                        <select name="stage" defaultValue={lead.stage} className="h-7 min-w-0 flex-1 border border-input bg-white px-1 text-[11px]">
                          {LEAD_STAGES.map((stage) => (
                            <option key={stage} value={stage}>
                              {titleCase(stage)}
                            </option>
                          ))}
                        </select>
                        <button className="h-7 shrink-0 px-1.5 text-[11px] font-medium text-ford hover:underline">Move</button>
                      </form>
                    </article>
                  );
                })}
                {column.items.length === 0 ? (
                  <p className="px-1 py-2 text-center text-[10px] text-muted-foreground">No deals</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent,
  className,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("bg-white px-3 py-3", accent && "bg-[#eef4fb]", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function StageRow({
  stage,
  count,
  active,
  max,
}: {
  stage: (typeof LEAD_HAPPY_PATH)[number];
  count: number;
  active: boolean;
  max: number;
}) {
  const Icon = STAGE_ICONS[stage];
  const meta = LEAD_STAGE_META[stage];
  return (
    <Link
      href={`/admin/leads?stage=${stage}`}
      aria-current={active ? "page" : undefined}
      className={cn("flex items-center gap-3 border bg-white px-3 py-2", active ? "border-lincoln-gold ring-1 ring-lincoln-gold" : "border-chrome")}
    >
      <span className={cn("flex size-8 shrink-0 items-center justify-center", STAGE_TONE[stage])}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide">{meta.label}</span>
        <span className="mt-1 block h-1 overflow-hidden bg-[#eef1f4]">
          <span className="block h-full" style={{ width: `${count > 0 ? Math.max(8, (count / max) * 100) : 0}%`, backgroundColor: LEAD_STAGE_COLORS[stage] }} />
        </span>
      </span>
      <span className="text-lg font-semibold tabular-nums">{count}</span>
    </Link>
  );
}

function FlowMeter({ data, className }: { data: ReturnType<typeof buildLeadPipeline>; className?: string }) {
  const rounded = Math.round(data.progressPct);
  const summary =
    data.total === 0
      ? "Pipeline clear · 0%"
      : data.open === 0
        ? `Closed book · ${data.sold} sold`
        : `${data.open} in motion · most in ${LEAD_STAGE_META[data.leading ?? "new"].label}`;

  return (
    <div className={cn("relative overflow-hidden border border-white/70 bg-white/70", className)}>
      <div className="relative space-y-2 px-3 py-2.5">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Flow progress</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{summary}</p>
          </div>
          <p className="text-2xl font-semibold tabular-nums leading-none">{rounded}%</p>
        </div>
        <div
          className="relative h-3.5 overflow-hidden border border-white/60 bg-black/[0.07]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-label={summary}
        >
          <div className="absolute inset-y-0 left-0 bg-linear-to-r from-ford via-ford-bright to-lincoln-gold" style={{ width: `${data.progressPct}%` }} />
          {LEAD_HAPPY_PATH.slice(1).map((stage, index) => (
            <span
              key={stage}
              className="absolute inset-y-0 w-px bg-white/50"
              style={{ left: `${((index + 1) / LEAD_HAPPY_PATH.length) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
          {LEAD_HAPPY_PATH.map((stage) => (
            <Link key={stage} href={`/admin/leads?stage=${stage}`} className={cn("hover:text-ford", data.active === stage && "font-semibold text-foreground")}>
              {LEAD_STAGE_META[stage].short}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
