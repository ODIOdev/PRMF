import { LEAD_STAGE_COLORS, LEAD_STAGES } from "@/lib/admin/overview";
import type { LeadStage } from "@/lib/types";

export const LEAD_HAPPY_PATH = ["new", "contacted", "appointment", "proposal", "sold"] as const satisfies readonly LeadStage[];

export const LEAD_STAGE_META: Record<
  LeadStage,
  { label: string; short: string; hint: string; description: string }
> = {
  new: { label: "New", short: "New", hint: "Just in", description: "Web and phone inquiries" },
  contacted: { label: "Contacted", short: "Reach", hint: "First touch", description: "Desk has reached out" },
  appointment: { label: "Appointment", short: "Visit", hint: "On the calendar", description: "Showroom or service booked" },
  proposal: { label: "Proposal", short: "Offer", hint: "Numbers out", description: "Quote, pencil, or write-up" },
  sold: { label: "Sold", short: "Sold", hint: "Closed won", description: "Deal delivered" },
  lost: { label: "Lost", short: "Lost", hint: "Off-path", description: "Dead or walked" },
};

export type PipelineLead = {
  id: string;
  stage: string;
  type: string | null;
  brand: string | null;
  source: string | null;
  created_at: string;
  customers:
    | { first_name: string | null; last_name: string | null; email: string | null; phone: string | null }
    | { first_name: string | null; last_name: string | null; email: string | null; phone: string | null }[]
    | null;
};

export function isLeadStage(value: string | undefined): value is LeadStage {
  return Boolean(value && (LEAD_STAGES as readonly string[]).includes(value));
}

export function conversionRate(from: number, to: number) {
  if (from <= 0) return null;
  return to / from;
}

export function leadDisplayName(lead: PipelineLead) {
  const customer = Array.isArray(lead.customers) ? lead.customers[0] : lead.customers;
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ");
  return name || "Web lead";
}

export function leadCustomer(lead: PipelineLead) {
  return Array.isArray(lead.customers) ? lead.customers[0] : lead.customers;
}

export function buildLeadPipeline(leads: PipelineLead[], activeStage?: string) {
  const active = isLeadStage(activeStage) ? activeStage : "all";
  const counts = Object.fromEntries(LEAD_STAGES.map((stage) => [stage, 0])) as Record<LeadStage, number>;
  const types = { sales: 0, service: 0, finance: 0, trade: 0, other: 0 };
  let ford = 0;
  let lincoln = 0;
  const weekAgo = Date.now() - 7 * 86_400_000;
  let thisWeek = 0;

  for (const lead of leads) {
    if (isLeadStage(lead.stage)) counts[lead.stage] += 1;
    if (lead.type === "sales" || lead.type === "service" || lead.type === "finance" || lead.type === "trade") {
      types[lead.type] += 1;
    } else {
      types.other += 1;
    }
    if (lead.brand === "lincoln") lincoln += 1;
    else if (lead.brand === "ford") ford += 1;
    if (new Date(lead.created_at).getTime() >= weekAgo) thisWeek += 1;
  }

  const open = counts.new + counts.contacted + counts.appointment + counts.proposal;
  const closed = counts.sold + counts.lost;
  const winRate = conversionRate(closed, counts.sold);
  const columns = LEAD_STAGES.map((stage) => ({
    stage,
    ...LEAD_STAGE_META[stage],
    color: LEAD_STAGE_COLORS[stage],
    items: leads.filter((lead) => lead.stage === stage),
  }));

  const conversions = LEAD_HAPPY_PATH.slice(0, -1).map((stage, index) => {
    const next = LEAD_HAPPY_PATH[index + 1]!;
    return {
      from: stage,
      to: next,
      rate: conversionRate(counts[stage], counts[next]),
    };
  });

  const happyTotal = LEAD_HAPPY_PATH.reduce((sum, stage) => sum + counts[stage], 0);
  const progressPct =
    happyTotal === 0
      ? 0
      : LEAD_HAPPY_PATH.reduce(
          (sum, stage, index) => sum + counts[stage] * (((index + 0.5) / LEAD_HAPPY_PATH.length) * 100),
          0,
        ) / happyTotal;

  const furthest = LEAD_HAPPY_PATH.reduce((far, stage, index) => (counts[stage] > 0 ? index : far), -1);
  const railPct = furthest < 0 ? 0 : Math.min(80, ((furthest + 0.5) / LEAD_HAPPY_PATH.length) * 80);
  const leading = columns.reduce((best, column) => (column.items.length > best.items.length ? column : best), columns[0]!);

  return {
    active,
    counts,
    columns,
    conversions,
    open,
    sold: counts.sold,
    lost: counts.lost,
    total: leads.length,
    winRate,
    thisWeek,
    types,
    ford,
    lincoln,
    progressPct,
    railPct,
    leading: leading.items.length > 0 ? leading.stage : null,
  };
}

export type LeadPipelineSnapshot = ReturnType<typeof buildLeadPipeline>;
