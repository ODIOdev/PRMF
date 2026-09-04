import { dealership } from "@/lib/dealership";

export const APPOINTMENT_TYPES = ["test_drive", "service", "delivery"] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const APPOINTMENT_TYPE_META: Record<
  AppointmentType,
  { label: string; hint: string; place: string; address: string }
> = {
  test_drive: {
    label: "Test drive",
    hint: "Showroom",
    place: dealership.showroom.name,
    address: `${dealership.showroom.address}, ${dealership.showroom.city}`,
  },
  service: {
    label: "Service",
    hint: "Shop",
    place: dealership.serviceCenter.name,
    address: `${dealership.serviceCenter.address}, ${dealership.serviceCenter.city}`,
  },
  delivery: {
    label: "Delivery",
    hint: "Handoff",
    place: dealership.showroom.name,
    address: `${dealership.showroom.address}, ${dealership.showroom.city}`,
  },
};

const NY_TZ = "America/New_York";

export type DeskAppointment = {
  id: string;
  type: string;
  starts_at: string;
  notes: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  customers:
    | { id?: string; first_name: string | null; last_name: string | null; email: string | null; phone: string | null }
    | { id?: string; first_name: string | null; last_name: string | null; email: string | null; phone: string | null }[]
    | null;
};

export type DeskLead = {
  id: string;
  type: string | null;
  brand: string | null;
  created_at: string;
  customers:
    | { first_name: string | null; last_name: string | null; phone: string | null }
    | { first_name: string | null; last_name: string | null; phone: string | null }[]
    | null;
};

export type DeskCustomer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

export function isAppointmentType(value: string | undefined): value is AppointmentType {
  return Boolean(value && (APPOINTMENT_TYPES as readonly string[]).includes(value));
}

export function nyDayKey(input: Date | string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof input === "string" ? new Date(input) : input);
}

export function addCalendarDays(isoDay: string, days: number) {
  const [year, month, day] = isoDay.split("-").map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day!));
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function shortDayLabel(isoDay: string) {
  const date = new Date(`${isoDay}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "numeric", day: "numeric", timeZone: "UTC" }).format(date);
}

export function formatApptWhen(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: NY_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatApptTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: NY_TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function nyHour(iso: string) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: NY_TZ,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date(iso)).find((part) => part.type === "hour")?.value;
  return Number(hour ?? 0);
}

export function appointmentTypeOf(value: string): AppointmentType {
  return isAppointmentType(value) ? value : "test_drive";
}

export function appointmentCustomer(row: DeskAppointment | DeskLead) {
  return Array.isArray(row.customers) ? row.customers[0] : row.customers;
}

export function appointmentName(row: DeskAppointment | DeskLead) {
  const customer = appointmentCustomer(row);
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ");
  return name || "Walk-in";
}

export function buildAppointmentDesk(input: {
  appointments: DeskAppointment[];
  waitingLeads: DeskLead[];
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const today = nyDayKey(now);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addCalendarDays(today, index);
    return { date, label: shortDayLabel(date) };
  });
  const weekSet = new Set(weekDays.map((day) => day.date));
  const nowMs = now.getTime();

  const rows = input.appointments.map((row) => ({
    ...row,
    day: nyDayKey(row.starts_at),
    hour: nyHour(row.starts_at),
    kind: appointmentTypeOf(row.type),
    upcoming: new Date(row.starts_at).getTime() >= nowMs,
  }));

  const todayRows = rows.filter((row) => row.day === today).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const weekRows = rows.filter((row) => weekSet.has(row.day));
  const upcomingRows = rows.filter((row) => row.upcoming).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const pastRows = rows.filter((row) => !row.upcoming).sort((a, b) => b.starts_at.localeCompare(a.starts_at));

  const typeCounts = Object.fromEntries(APPOINTMENT_TYPES.map((type) => [type, weekRows.filter((row) => row.kind === type).length])) as Record<
    AppointmentType,
    number
  >;
  const typeAll = Object.fromEntries(APPOINTMENT_TYPES.map((type) => [type, rows.filter((row) => row.kind === type).length])) as Record<
    AppointmentType,
    number
  >;

  const dayCounts = weekDays.map((day) => ({
    ...day,
    count: rows.filter((row) => row.day === day.date).length,
    types: Object.fromEntries(APPOINTMENT_TYPES.map((type) => [type, rows.filter((row) => row.day === day.date && row.kind === type).length])) as Record<
      AppointmentType,
      number
    >,
  }));
  const dayMax = Math.max(...dayCounts.map((day) => day.count), 1);

  const hours = Array.from({ length: 13 }, (_, index) => index + 9);
  const hourly = hours.map((hour) => ({
    hour,
    label: hour === 12 ? "12p" : hour > 12 ? `${hour - 12}p` : `${hour}a`,
    count: todayRows.filter((row) => row.hour === hour).length,
  }));
  const hourMax = Math.max(...hourly.map((row) => row.count), 1);
  const peakHour = hourly.reduce((best, row) => (row.count > best.count ? row : best), hourly[0]!);

  return {
    today,
    todayRows,
    weekRows,
    upcomingRows,
    pastRows,
    typeCounts,
    typeAll,
    dayCounts,
    dayMax,
    hourly,
    hourMax,
    peakHour: peakHour.count > 0 ? peakHour : null,
    waitingLeads: input.waitingLeads,
    totals: {
      today: todayRows.length,
      week: weekRows.length,
      upcoming: upcomingRows.length,
      past: pastRows.length,
      all: rows.length,
    },
  };
}

export type AppointmentDeskSnapshot = ReturnType<typeof buildAppointmentDesk>;
