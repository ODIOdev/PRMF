import Link from "next/link";
import { Mail, Phone, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { createCustomer } from "@/app/admin/(staff)/crm-actions";
import { AdminPanel } from "@/components/admin/admin-panel";
import { formatPhoneHref } from "@/lib/format";
import {
  STAFF_ROLE_META,
  isPeopleView,
  peopleHref,
  type DeskClient,
  type DeskMember,
  type PeopleDeskData,
  type PeopleView,
} from "@/lib/admin/people";
import { cn } from "@/lib/utils";

const SEGMENTS: { id: PeopleView | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "admins", label: "Admins" },
  { id: "staff", label: "Staff" },
  { id: "clients", label: "Clients" },
];

function shortDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function PeopleDesk({ data, view }: { data: PeopleDeskData; view?: string }) {
  const active = isPeopleView(view) ? view : "all";
  const showAdmins = active === "all" || active === "admins";
  const showStaff = active === "all" || active === "staff";
  const showClients = active === "all" || active === "clients";
  const total = data.admins.length + data.staff.length + data.clients.length;

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-3 gap-px overflow-hidden border border-chrome bg-chrome" aria-label="People totals">
        <Kpi
          href={peopleHref(active === "admins" ? undefined : "admins")}
          label="Admins"
          value={String(data.admins.length)}
          hint="Desk owners"
          active={active === "admins"}
        />
        <Kpi
          href={peopleHref(active === "staff" ? undefined : "staff")}
          label="Staff"
          value={String(data.staff.length)}
          hint="Sales and service"
          active={active === "staff"}
        />
        <Kpi
          href={peopleHref(active === "clients" ? undefined : "clients")}
          label="Clients"
          value={String(data.clients.length)}
          hint="CRM book"
          active={active === "clients"}
        />
      </section>

      <AdminPanel>
        <div className="flex items-center gap-2 overflow-x-auto border-b border-chrome bg-[#f4f6f8] px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div role="group" aria-label="People view" className="inline-flex h-9 shrink-0 divide-x divide-chrome overflow-hidden border border-chrome bg-white">
            {SEGMENTS.map((segment) => {
              const selected = segment.id === "all" ? active === "all" : active === segment.id;
              return (
                <Link
                  key={segment.id}
                  href={peopleHref(segment.id === "all" ? undefined : segment.id)}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "inline-flex h-full items-center px-3 text-[11px] font-semibold tracking-wide whitespace-nowrap",
                    selected ? "bg-ford text-white" : "text-muted-foreground hover:bg-[#eef4fb] hover:text-ford",
                  )}
                >
                  {segment.label}
                </Link>
              );
            })}
          </div>
          <p className="ml-auto hidden text-[11px] text-muted-foreground sm:block">
            {total === 1 ? "1 person on the desk" : `${total} people on the desk`}
          </p>
        </div>

        <div className="space-y-6 px-3 py-4">
          {showAdmins ? (
            <PeopleSection
              title="Admins"
              hint="Sign-in accounts with admin role"
              count={data.admins.length}
              empty="No admin profiles yet. Desk owners appear here after they sign in."
            >
              {data.admins.map((row) => (
                <MemberRow key={row.id} row={row} />
              ))}
            </PeopleSection>
          ) : null}

          {showStaff ? (
            <PeopleSection
              title="Staff"
              hint="Sales and service on the floor"
              count={data.staff.length}
              empty="No sales or service profiles yet. Floor staff who sign in land here."
            >
              {data.staff.map((row) => (
                <MemberRow key={row.id} row={row} />
              ))}
            </PeopleSection>
          ) : null}

          {showClients ? (
            <PeopleSection
              title="Clients"
              hint="Walk-ins, web leads, and the book"
              count={data.clients.length}
              empty="No clients yet. Web forms, phone-ups, and walk-ins land here."
              lead={<AddClientForm />}
            >
              {data.clients.map((row) => (
                <ClientRow key={row.id} row={row} />
              ))}
            </PeopleSection>
          ) : null}
        </div>
      </AdminPanel>
    </div>
  );
}

function PeopleSection({
  title,
  hint,
  count,
  empty,
  lead,
  children,
}: {
  title: string;
  hint: string;
  count: number;
  empty: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <p className="text-[11px] tabular-nums text-muted-foreground">{count}</p>
      </div>
      {lead}
      {count === 0 ? (
        <p className="mt-3 border border-dashed border-chrome bg-[#f7f8fa] px-3 py-8 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className={cn("divide-y divide-chrome/70 border border-chrome", lead && "mt-3")}>{children}</ul>
      )}
    </section>
  );
}

function MemberRow({ row }: { row: DeskMember }) {
  const meta = STAFF_ROLE_META[row.role];
  const joined = shortDate(row.createdAt);
  const lastIn = shortDate(row.lastSignInAt);
  return (
    <li className="flex gap-3 bg-white px-3 py-3">
      <span className={cn("w-1 shrink-0 self-stretch", meta.bar)} aria-hidden />
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center text-xs font-bold",
          row.role === "admin" ? "bg-ford text-white" : row.role === "service" ? "bg-lincoln-gold text-lincoln" : "bg-[#dbe7f5] text-ford",
        )}
      >
        {row.initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{row.name}</p>
            {row.email ? (
              <a href={`mailto:${row.email}`} className="mt-0.5 block truncate text-xs text-ford hover:underline">
                {row.email}
              </a>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">No email on file</p>
            )}
          </div>
          <span className={cn("px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", meta.tone)}>{meta.label}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span>{meta.desk}</span>
          <span className="tabular-nums">{row.openDeals === 1 ? "1 open deal" : `${row.openDeals} open deals`}</span>
          <span className="tabular-nums">{row.openTasks === 1 ? "1 task" : `${row.openTasks} tasks`}</span>
          {lastIn ? <span>Last in {lastIn}</span> : joined ? <span>Added {joined}</span> : null}
        </div>
      </div>
    </li>
  );
}

function ClientRow({ row }: { row: DeskClient }) {
  const body = (
    <div className="flex gap-3 px-3 py-3">
      <span className="w-1 shrink-0 self-stretch bg-[#c5ccd3]" aria-hidden />
      <span className="flex size-10 shrink-0 items-center justify-center bg-[#eef1f4] text-xs font-bold text-ford">{row.initials}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{row.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.location || "No address on file"}</p>
          </div>
          {row.leadStageLabel ? (
            <span
              className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
              style={{ backgroundColor: row.leadStageColor ?? "#003478" }}
            >
              {row.leadStageLabel}
            </span>
          ) : (
            <span className="bg-[#eef1f4] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Book</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {row.email ? (
            row.leadId ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Mail className="size-3" />
                {row.email}
              </span>
            ) : (
              <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1 text-[11px] text-ford hover:underline">
                <Mail className="size-3" />
                {row.email}
              </a>
            )
          ) : null}
          {row.phone ? (
            row.leadId ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Phone className="size-3" />
                {row.phone}
              </span>
            ) : (
              <a href={formatPhoneHref(row.phone)} className="inline-flex items-center gap-1 text-[11px] text-ford hover:underline">
                <Phone className="size-3" />
                {row.phone}
              </a>
            )
          ) : null}
          {row.emailConsent ? (
            <span className="bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">Email</span>
          ) : null}
          {row.smsConsent ? (
            <span className="bg-[#dbe7f5] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ford">SMS</span>
          ) : null}
          {!row.emailConsent && !row.smsConsent ? (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">No consent</span>
          ) : null}
          <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
            {row.openDeals} open · {shortDate(row.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );

  if (row.leadId) {
    return (
      <li className="bg-white hover:bg-[#f7f8fa]">
        <Link href={`/admin/leads/${row.leadId}`}>{body}</Link>
      </li>
    );
  }

  return <li className="bg-white">{body}</li>;
}

function AddClientForm() {
  return (
    <form action={createCustomer} className="border border-chrome bg-[#f7f8fa] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Add client</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <input name="first_name" placeholder="First name" className="h-9 border border-input bg-white px-2.5 text-sm" />
        <input name="last_name" placeholder="Last name" className="h-9 border border-input bg-white px-2.5 text-sm" />
        <input name="email" type="email" placeholder="Email" className="h-9 border border-input bg-white px-2.5 text-sm" />
        <input name="phone" type="tel" placeholder="Phone" className="h-9 border border-input bg-white px-2.5 text-sm" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <input type="checkbox" name="email_consent" className="size-3.5 accent-[#003478]" />
          Email consent
        </label>
        <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <input type="checkbox" name="sms_consent" className="size-3.5 accent-[#003478]" />
          SMS consent
        </label>
        <button className="ml-auto inline-flex h-9 items-center justify-center gap-1.5 bg-ford px-3 text-sm font-medium text-white hover:bg-ford-bright">
          <Plus className="size-3.5" />
          Save client
        </button>
      </div>
    </form>
  );
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
    <Link href={href} className={cn("bg-white px-3 py-2.5 hover:bg-[#f7f8fa]", active && "bg-[#eef4fb]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </Link>
  );
}
