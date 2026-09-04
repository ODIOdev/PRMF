import Link from "next/link";
import { Car, Clock, MapPin, Truck, Wrench, type LucideIcon } from "lucide-react";
import { createAppointment } from "@/app/admin/(staff)/crm-actions";
import { AdminPanel } from "@/components/admin/admin-panel";
import { dealership } from "@/lib/dealership";
import {
  APPOINTMENT_TYPE_META,
  APPOINTMENT_TYPES,
  appointmentCustomer,
  appointmentName,
  appointmentTypeOf,
  buildAppointmentDesk,
  formatApptTime,
  formatApptWhen,
  isAppointmentType,
  type AppointmentType,
  type DeskAppointment,
  type DeskCustomer,
  type DeskLead,
} from "@/lib/admin/appointments";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<AppointmentType, LucideIcon> = {
  test_drive: Car,
  service: Wrench,
  delivery: Truck,
};

const TYPE_TONE: Record<AppointmentType, string> = {
  test_drive: "bg-[#dbe7f5] text-ford",
  service: "bg-[#d7eef8] text-[#0f5f8a]",
  delivery: "bg-[#f7edd4] text-[#8a6a22]",
};

const TYPE_BAR: Record<AppointmentType, string> = {
  test_drive: "bg-ford",
  service: "bg-ford-bright",
  delivery: "bg-lincoln-gold",
};

export function AppointmentsDesk({
  appointments,
  waitingLeads,
  customers,
  activeType,
  activeWhen,
  activeDay,
}: {
  appointments: DeskAppointment[];
  waitingLeads: DeskLead[];
  customers: DeskCustomer[];
  activeType?: string;
  activeWhen?: string;
  activeDay?: string;
}) {
  const data = buildAppointmentDesk({ appointments, waitingLeads });
  const typeFilter = isAppointmentType(activeType) ? activeType : null;
  const when = activeWhen === "today" || activeWhen === "week" || activeWhen === "past" ? activeWhen : "upcoming";
  const dayFilter = data.dayCounts.some((day) => day.date === activeDay) ? activeDay : null;

  const href = (params: { type?: string | null; when?: string | null; day?: string | null }) => {
    const search = new URLSearchParams();
    const type = params.type === undefined ? typeFilter : params.type;
    const nextWhen = params.when === undefined ? (dayFilter ? null : when) : params.when;
    const day = params.day === undefined ? dayFilter : params.day;
    if (type) search.set("type", type);
    if (nextWhen && nextWhen !== "upcoming" && !day) search.set("when", nextWhen);
    if (day) search.set("day", day);
    const query = search.toString();
    return query ? `/admin/appointments?${query}` : "/admin/appointments";
  };

  const matches = (row: { day: string; kind: AppointmentType }) => {
    if (typeFilter && row.kind !== typeFilter) return false;
    if (dayFilter && row.day !== dayFilter) return false;
    return true;
  };

  const listRows = dayFilter
    ? [...data.weekRows, ...data.pastRows.filter((row) => row.day === dayFilter && !data.weekRows.some((item) => item.id === row.id))]
        .filter(matches)
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    : when === "today"
      ? data.todayRows.filter(matches)
      : when === "week"
        ? data.weekRows.filter(matches).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
        : when === "past"
          ? data.pastRows.filter(matches)
          : data.upcomingRows.filter(matches);

  const listTitle = dayFilter
    ? shortHeading(dayFilter)
    : when === "today"
      ? "Today"
      : when === "week"
        ? "This week"
        : when === "past"
          ? "Past visits"
          : "Upcoming";

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-px overflow-hidden border border-chrome bg-chrome sm:grid-cols-4" aria-label="Appointment totals">
        <Kpi href={href({ when: "today", day: null })} label="Today" value={String(data.totals.today)} hint={data.peakHour ? `Peak ${data.peakHour.label}` : "Brooklyn desk"} active={when === "today" && !dayFilter} />
        <Kpi href={href({ when: "week", day: null })} label="This week" value={String(data.totals.week)} hint="Next 7 days" active={when === "week" && !dayFilter} />
        <Kpi href={href({ when: "upcoming", day: null })} label="Upcoming" value={String(data.totals.upcoming)} hint="Still on the book" active={when === "upcoming" && !dayFilter} />
        <Kpi href={href({ when: "past", day: null })} label="Past" value={String(data.totals.past)} hint="Already started" active={when === "past" && !dayFilter} />
      </section>

      <section className="grid gap-2 md:grid-cols-3" aria-label="Visit types">
        {APPOINTMENT_TYPES.map((type) => {
          const meta = APPOINTMENT_TYPE_META[type];
          const Icon = TYPE_ICONS[type];
          const count = data.typeCounts[type];
          const active = typeFilter === type;
          const max = Math.max(...APPOINTMENT_TYPES.map((item) => data.typeCounts[item]), 1);
          return (
            <Link
              key={type}
              href={href({ type: active ? null : type })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block border p-4",
                type === "delivery"
                  ? "border-lincoln-gold/50 bg-[linear-gradient(160deg,#fbf6e8_0%,#ffffff_55%,#f7eed8_100%)]"
                  : type === "service"
                    ? "border-ford-bright/40 bg-[linear-gradient(160deg,#e8f5fb_0%,#ffffff_55%,#dceff8_100%)]"
                    : "border-ford/30 bg-[linear-gradient(160deg,#eef4fb_0%,#ffffff_55%,#e8f1fa_100%)]",
                active && "ring-1 ring-ford/25",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{meta.hint}</p>
                  <h2 className="mt-0.5 text-sm font-semibold tracking-tight">{meta.label}</h2>
                </div>
                <span className={cn("flex size-9 items-center justify-center", TYPE_TONE[type])}>
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight">{count}</p>
              <p className="mt-1 text-xs text-muted-foreground">{meta.place} · next 7 days</p>
              <div className="mt-3 h-1.5 overflow-hidden bg-white/80">
                <div className={cn("h-full", TYPE_BAR[type])} style={{ width: `${count > 0 ? Math.max(8, (count / max) * 100) : 0}%` }} />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="border border-chrome bg-white p-3" aria-label="Next seven days">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Week load</h2>
          <p className="text-[11px] text-muted-foreground">New York time · click a day</p>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {data.dayCounts.map((day) => {
            const active = dayFilter === day.date;
            const isToday = day.date === data.today;
            return (
              <Link
                key={day.date}
                href={href({ day: active ? null : day.date, when: null })}
                className={cn(
                  "flex min-h-[7.5rem] flex-col border px-1.5 py-2 text-center",
                  active ? "border-lincoln-gold bg-[#fbf6e8] ring-1 ring-lincoln-gold" : "border-chrome bg-[#f7f8fa] hover:border-ford/40 hover:bg-white",
                )}
              >
                <span className={cn("text-[10px] font-semibold uppercase tracking-wide", isToday ? "text-ford" : "text-muted-foreground")}>
                  {day.label}
                </span>
                <span className="mt-1 text-xl font-semibold tabular-nums leading-none">{day.count}</span>
                <span className="mt-auto flex h-16 items-end justify-center gap-0.5">
                  {APPOINTMENT_TYPES.map((type) => (
                    <span
                      key={type}
                      className={cn("w-1.5", TYPE_BAR[type])}
                      style={{ height: `${day.types[type] > 0 ? Math.max(10, (day.types[type] / data.dayMax) * 100) : 4}%` }}
                    />
                  ))}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-12">
        <AdminPanel className="p-4 lg:col-span-8">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Today’s board</h2>
              <p className="text-xs text-muted-foreground">
                {data.todayRows.length === 0
                  ? "Nothing on the calendar today."
                  : `${data.todayRows.length} visit${data.todayRows.length === 1 ? "" : "s"} · Glenwood and East 49th`}
              </p>
            </div>
            <Link href={href({ when: "today", day: null })} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-ford">
              Filter today
            </Link>
          </div>
          <div className="mb-4 flex h-16 items-end gap-1">
            {data.hourly.map((slot) => (
              <div key={slot.hour} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <div className="flex h-12 w-full items-end justify-center">
                  <span
                    className={cn("w-full max-w-6", slot.count > 0 ? "bg-ford" : "bg-[#eef1f4]")}
                    style={{ height: slot.count > 0 ? `${Math.max(12, (slot.count / data.hourMax) * 100)}%` : "4px" }}
                    title={`${slot.label}: ${slot.count}`}
                  />
                </div>
                <span className="text-[9px] tabular-nums text-muted-foreground">{slot.label}</span>
              </div>
            ))}
          </div>
          <ol className="space-y-2">
            {data.todayRows.map((row) => (
              <li key={row.id}>
                <AgendaRow row={row} />
              </li>
            ))}
            {data.todayRows.length === 0 ? (
              <li className="border border-dashed border-chrome px-3 py-8 text-center text-sm text-muted-foreground">No visits booked today.</li>
            ) : null}
          </ol>
        </AdminPanel>

        <div className="grid gap-3 lg:col-span-4">
          <AdminPanel className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Hours</p>
            <h2 className="mt-1 text-sm font-semibold tracking-tight">Premier Brooklyn</h2>
            <ul className="mt-3 space-y-1.5 text-xs">
              {dealership.hours.map((row) => (
                <li key={row.days} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{row.days}</span>
                  <span className="tabular-nums">{row.time.replaceAll(":00", "")}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-ford" />
                <span>
                  <span className="font-medium">Showroom</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    {dealership.showroom.address}, {dealership.showroom.city}
                  </span>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Wrench className="mt-0.5 size-3.5 shrink-0 text-ford-bright" />
                <span>
                  <span className="font-medium">Service</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    {dealership.serviceCenter.address}, {dealership.serviceCenter.city}
                  </span>
                </span>
              </p>
            </div>
          </AdminPanel>
          <AdminPanel className="p-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight">Needs a slot</h2>
              <Link href="/admin/leads?stage=appointment" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-ford">
                Pipeline
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">Leads sitting in Appointment with no time on this book.</p>
            <ul className="mt-3 divide-y divide-chrome/70">
              {data.waitingLeads.slice(0, 5).map((lead) => (
                <li key={lead.id}>
                  <Link href={`/admin/leads/${lead.id}`} className="flex items-baseline justify-between gap-2 py-2 hover:text-ford">
                    <span className="min-w-0 truncate text-sm font-medium">{appointmentName(lead)}</span>
                    <span className="shrink-0 text-[11px] capitalize text-muted-foreground">{lead.type ?? "lead"}</span>
                  </Link>
                </li>
              ))}
              {data.waitingLeads.length === 0 ? (
                <li className="py-4 text-center text-xs text-muted-foreground">No appointment-stage deals waiting.</li>
              ) : null}
            </ul>
          </AdminPanel>
        </div>
      </section>

      <AdminPanel className="p-4">
        <h2 className="text-sm font-semibold tracking-tight">Schedule a visit</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Times save on the desk calendar. Attach a customer when you have one.</p>
        <form action={createAppointment} className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <select name="type" className="h-10 border border-input bg-white px-3 text-sm" defaultValue={typeFilter ?? "test_drive"}>
            {APPOINTMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {APPOINTMENT_TYPE_META[type].label}
              </option>
            ))}
          </select>
          <input name="starts_at" type="datetime-local" required className="h-10 border border-input bg-white px-3 text-sm" />
          <select name="customer_id" className="h-10 border border-input bg-white px-3 text-sm">
            <option value="">Walk-in / no customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {[customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Customer"}
                {customer.phone ? ` · ${customer.phone}` : ""}
              </option>
            ))}
          </select>
          <input name="notes" placeholder="Notes" className="h-10 border border-input bg-white px-3 text-sm" />
          <button className="h-10 bg-ford text-sm font-medium text-white hover:bg-ford-bright">Schedule</button>
        </form>
      </AdminPanel>

      <section>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">{listTitle}</h2>
          <p className="text-xs text-muted-foreground">
            {listRows.length} visit{listRows.length === 1 ? "" : "s"}
            {typeFilter ? ` · ${APPOINTMENT_TYPE_META[typeFilter].label}` : ""}
          </p>
        </div>
        <ul className="space-y-2">
          {listRows.map((row) => (
            <li key={row.id}>
              <AgendaRow row={row} detailed />
            </li>
          ))}
          {listRows.length === 0 ? (
            <li className="border border-dashed border-chrome bg-white px-4 py-10 text-center text-sm text-muted-foreground">Nothing in this view.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

function shortHeading(isoDay: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${isoDay}T12:00:00Z`));
}

function Kpi({
  href,
  label,
  value,
  hint,
  active,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className={cn("bg-white px-3 py-3 hover:bg-[#f7f8fa]", active && "bg-[#eef4fb]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </Link>
  );
}

function AgendaRow({ row, detailed }: { row: DeskAppointment & { kind?: AppointmentType }; detailed?: boolean }) {
  const kind = row.kind ?? appointmentTypeOf(row.type);
  const Icon = TYPE_ICONS[kind];
  const meta = APPOINTMENT_TYPE_META[kind];
  const customer = appointmentCustomer(row);
  return (
    <article className="flex gap-3 border border-chrome bg-white px-3 py-3">
      <span className={cn("flex size-9 shrink-0 items-center justify-center", TYPE_TONE[kind])}>
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-medium">{appointmentName(row)}</p>
          <p className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Clock className="size-3" />
            {detailed ? formatApptWhen(row.starts_at) : formatApptTime(row.starts_at)}
          </p>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {meta.label}
          {customer?.phone ? ` · ${customer.phone}` : ""}
        </p>
        {detailed ? <p className="mt-1 text-[11px] text-muted-foreground">{meta.address}</p> : null}
        {row.notes ? <p className="mt-1 text-sm">{row.notes}</p> : null}
      </div>
    </article>
  );
}
