import { daysOnLot } from "@/lib/admin/format";

export type OverviewVehicle = {
  id: string;
  brand: string | null;
  status: string;
  condition: string | null;
  created_at: string;
  internet_price: number | null;
  msrp: number | null;
  year: number | null;
  make: string | null;
  model: string | null;
};

export type OverviewLead = {
  id: string;
  stage: string;
  type: string;
  brand: string | null;
  created_at: string;
  customers: { first_name: string | null; last_name: string | null } | { first_name: string | null; last_name: string | null }[] | null;
};

export const LEAD_STAGES = ["new", "contacted", "appointment", "proposal", "sold", "lost"] as const;
export const LEAD_STAGE_COLORS: Record<(typeof LEAD_STAGES)[number], string> = {
  new: "#003478",
  contacted: "#1b86c8",
  appointment: "#edcf8c",
  proposal: "#5a7a9a",
  sold: "#1a7f5a",
  lost: "#9aa3ad",
};

export const AGING_BUCKETS = [
  { id: "0-30", label: "0–30 days", min: 0, max: 30 },
  { id: "31-60", label: "31–60 days", min: 31, max: 60 },
  { id: "61-90", label: "61–90 days", min: 61, max: 90 },
  { id: "90+", label: "90+ days", min: 91, max: Infinity },
] as const;

export function vehiclePrice(row: OverviewVehicle) {
  return Number(row.internet_price ?? row.msrp ?? 0);
}

export function leadName(lead: OverviewLead) {
  const customer = Array.isArray(lead.customers) ? lead.customers[0] : lead.customers;
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ");
  return name || "Web lead";
}

export type PulsePoint = {
  date: string;
  label: string;
  ford: number;
  lincoln: number;
  leads: number;
  fordValue: number;
  lincolnValue: number;
};

const NY_TZ = "America/New_York";

function nyDayKey(input: Date | string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof input === "string" ? new Date(input) : input);
}

function addCalendarDays(isoDay: string, days: number) {
  const [year, month, day] = isoDay.split("-").map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day!));
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function shortDayLabel(isoDay: string) {
  const [, month, day] = isoDay.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export function buildOverviewSnapshot(input: {
  vehicles: OverviewVehicle[];
  leads: OverviewLead[];
  openTasks: number;
  todayAppointments: { id: string; type: string; starts_at: string }[];
}) {
  const live = input.vehicles.filter((row) => row.status === "in_stock" || row.status === "in_transit");
  const inStock = input.vehicles.filter((row) => row.status === "in_stock");
  const inTransit = input.vehicles.filter((row) => row.status === "in_transit");
  const priceOf = (rows: OverviewVehicle[]) => rows.reduce((sum, row) => sum + vehiclePrice(row), 0);

  const ford = live.filter((row) => row.brand === "ford");
  const lincoln = live.filter((row) => row.brand === "lincoln");
  const lotValue = priceOf(live);
  const fordValue = priceOf(ford);
  const lincolnValue = priceOf(lincoln);
  const aged = inStock.filter((row) => daysOnLot(row.created_at) >= 60);

  const byCondition = {
    new: live.filter((row) => row.condition === "new").length,
    used: live.filter((row) => row.condition === "used").length,
    cpo: live.filter((row) => row.condition === "cpo").length,
  };

  const aging = AGING_BUCKETS.map((bucket) => ({
    ...bucket,
    count: inStock.filter((row) => {
      const days = daysOnLot(row.created_at);
      return days >= bucket.min && days <= bucket.max;
    }).length,
  }));

  const stageCounts = LEAD_STAGES.map((stage) => ({
    stage,
    count: input.leads.filter((lead) => lead.stage === stage).length,
  }));
  const openDeals = input.leads.filter((lead) =>
    lead.stage === "new" || lead.stage === "contacted" || lead.stage === "appointment" || lead.stage === "proposal",
  ).length;
  const newLeads = input.leads.filter((lead) => lead.stage === "new").slice(0, 6);

  const models = new Map<string, { name: string; brand: string; count: number; value: number }>();
  for (const row of live) {
    const name = [row.year, row.make, row.model].filter(Boolean).join(" ") || "Unknown";
    const key = `${row.brand ?? "other"}:${name}`;
    const current = models.get(key) ?? { name, brand: row.brand ?? "other", count: 0, value: 0 };
    current.count += 1;
    current.value += vehiclePrice(row);
    models.set(key, current);
  }
  const topModels = [...models.values()].sort((a, b) => b.count - a.count || b.value - a.value).slice(0, 6);

  const days = 30;
  const todayKey = nyDayKey(new Date());
  const pulse: PulsePoint[] = Array.from({ length: days }, (_, index) => {
    const date = addCalendarDays(todayKey, -(days - 1 - index));
    return { date, label: shortDayLabel(date), ford: 0, lincoln: 0, leads: 0, fordValue: 0, lincolnValue: 0 };
  });
  const pulseIndex = new Map(pulse.map((point, index) => [point.date, index]));
  for (const row of input.vehicles) {
    const index = pulseIndex.get(nyDayKey(row.created_at));
    if (index == null) continue;
    const price = vehiclePrice(row);
    if (row.brand === "lincoln") {
      pulse[index]!.lincoln += 1;
      pulse[index]!.lincolnValue += price;
    } else {
      pulse[index]!.ford += 1;
      pulse[index]!.fordValue += price;
    }
  }
  for (const lead of input.leads) {
    const index = pulseIndex.get(nyDayKey(lead.created_at));
    if (index == null) continue;
    pulse[index]!.leads += 1;
  }

  return {
    inStock: inStock.length,
    inTransit: inTransit.length,
    sold: input.vehicles.filter((row) => row.status === "sold").length,
    lotValue,
    ford: ford.length,
    lincoln: lincoln.length,
    fordValue,
    lincolnValue,
    fordShare: lotValue > 0 ? fordValue / lotValue : 0,
    aged: aged.length,
    avgDays: inStock.length
      ? Math.round(inStock.reduce((sum, row) => sum + daysOnLot(row.created_at), 0) / inStock.length)
      : 0,
    byCondition,
    aging,
    stageCounts,
    openDeals,
    newLeads,
    openTasks: input.openTasks,
    todayAppointments: input.todayAppointments,
    topModels,
    pulse,
    agedUnits: aged
      .map((row) => ({
        id: row.id,
        name: [row.year, row.make, row.model].filter(Boolean).join(" ") || "Vehicle",
        days: daysOnLot(row.created_at),
        price: vehiclePrice(row),
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 5),
  };
}

export type OverviewSnapshot = ReturnType<typeof buildOverviewSnapshot>;
