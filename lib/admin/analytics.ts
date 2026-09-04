import { LEAD_HAPPY_PATH, LEAD_STAGE_META, conversionRate, isLeadStage } from "@/lib/admin/lead-pipeline";
import { LEAD_STAGE_COLORS, LEAD_STAGES } from "@/lib/admin/overview";
import { addCalendarDays, nyDayKey } from "@/lib/admin/appointments";
import { titleCase } from "@/lib/format";
import type { LeadStage } from "@/lib/types";

export type AnalyticsLead = {
  id: string;
  stage: string;
  type: string | null;
  brand: string | null;
  source: string | null;
  created_at: string;
};

export function buildAnalyticsSnapshot(leads: AnalyticsLead[]) {
  const counts = Object.fromEntries(LEAD_STAGES.map((stage) => [stage, 0])) as Record<LeadStage, number>;
  const types = { sales: 0, service: 0, finance: 0, trade: 0 };
  const brands = { ford: 0, lincoln: 0, other: 0 };
  const sources = new Map<string, number>();
  const weekAgo = Date.now() - 7 * 86_400_000;
  let thisWeek = 0;

  for (const lead of leads) {
    if (isLeadStage(lead.stage)) counts[lead.stage] += 1;
    if (lead.type === "sales" || lead.type === "service" || lead.type === "finance" || lead.type === "trade") {
      types[lead.type] += 1;
    }
    if (lead.brand === "lincoln") brands.lincoln += 1;
    else if (lead.brand === "ford") brands.ford += 1;
    else brands.other += 1;
    const source = titleCase(lead.source) || "Unknown";
    sources.set(source, (sources.get(source) ?? 0) + 1);
    if (new Date(lead.created_at).getTime() >= weekAgo) thisWeek += 1;
  }

  const open = counts.new + counts.contacted + counts.appointment + counts.proposal;
  const closed = counts.sold + counts.lost;
  const today = nyDayKey(new Date());
  const pulse = Array.from({ length: 30 }, (_, index) => {
    const date = addCalendarDays(today, -(29 - index));
    return {
      date,
      label: `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`,
      count: 0,
    };
  });
  const pulseIndex = new Map(pulse.map((point, index) => [point.date, index]));
  for (const lead of leads) {
    const index = pulseIndex.get(nyDayKey(lead.created_at));
    if (index != null) pulse[index]!.count += 1;
  }

  const conversions = LEAD_HAPPY_PATH.slice(0, -1).map((stage, index) => {
    const next = LEAD_HAPPY_PATH[index + 1]!;
    return { from: stage, to: next, rate: conversionRate(counts[stage], counts[next]) };
  });

  const sourceRows = [...sources.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    total: leads.length,
    open,
    sold: counts.sold,
    lost: counts.lost,
    thisWeek,
    winRate: conversionRate(closed, counts.sold),
    counts,
    conversions,
    types: [
      { id: "sales", label: "Sales", count: types.sales, href: "/admin/leads", color: "#003478" },
      { id: "service", label: "Service", count: types.service, href: "/admin/inbox", color: "#1b86c8" },
      { id: "finance", label: "Finance", count: types.finance, href: "/admin/leads", color: "#5a7a9a" },
      { id: "trade", label: "Trade", count: types.trade, href: "/admin/leads", color: "#edcf8c" },
    ],
    brands: [
      { id: "ford", label: "Ford", count: brands.ford, color: "#003478" },
      { id: "lincoln", label: "Lincoln", count: brands.lincoln, color: "#edcf8c" },
      { id: "other", label: "Other", count: brands.other, color: "#9aa3ad" },
    ],
    sources: sourceRows,
    pulse,
    stages: LEAD_STAGES.map((stage) => ({
      stage,
      ...LEAD_STAGE_META[stage],
      color: LEAD_STAGE_COLORS[stage],
      count: counts[stage],
    })),
  };
}

export type AnalyticsSnapshot = ReturnType<typeof buildAnalyticsSnapshot>;
