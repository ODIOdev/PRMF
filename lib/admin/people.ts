import { LEAD_STAGE_META, isLeadStage } from "@/lib/admin/lead-pipeline";
import { LEAD_STAGE_COLORS } from "@/lib/admin/overview";
import type { LeadStage } from "@/lib/types";

export const PEOPLE_VIEWS = ["admins", "staff", "clients"] as const;
export type PeopleView = (typeof PEOPLE_VIEWS)[number];
export type StaffRole = "admin" | "sales" | "service";

export type PeopleProfile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export type PeopleCustomer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  email_consent: boolean;
  sms_consent: boolean;
  created_at: string;
};

export type PeopleLead = {
  id: string;
  customer_id: string | null;
  assigned_to: string | null;
  stage: string;
  type: string | null;
  created_at: string;
  updated_at: string | null;
};

export type PeopleTask = {
  id: string;
  assigned_to: string | null;
  customer_id: string | null;
  completed_at: string | null;
};

export type AuthAccount = {
  email: string | null;
  lastSignInAt: string | null;
};

const OPEN_STAGES = new Set(["new", "contacted", "appointment", "proposal"]);

export function isPeopleView(value: string | undefined): value is PeopleView {
  return Boolean(value && (PEOPLE_VIEWS as readonly string[]).includes(value));
}

export function peopleHref(view?: string) {
  if (isPeopleView(view)) return `/admin/customers?view=${view}`;
  return "/admin/customers";
}

export function customerName(row: Pick<PeopleCustomer, "first_name" | "last_name">) {
  return [row.first_name, row.last_name].filter(Boolean).join(" ") || "Client";
}

export function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function isStaffRole(value: string | null | undefined): value is StaffRole {
  return value === "admin" || value === "sales" || value === "service";
}

export const STAFF_ROLE_META: Record<StaffRole, { label: string; desk: string; tone: string; bar: string }> = {
  admin: { label: "Admin", desk: "Desk owner", tone: "bg-ford text-white", bar: "bg-ford" },
  sales: { label: "Sales", desk: "Floor", tone: "bg-[#dbe7f5] text-ford", bar: "bg-ford-bright" },
  service: { label: "Service", desk: "Shop", tone: "bg-[#f7edd4] text-[#8a6a22]", bar: "bg-lincoln-gold" },
};

export type DeskMember = {
  id: string;
  name: string;
  initials: string;
  role: StaffRole;
  email: string | null;
  lastSignInAt: string | null;
  createdAt: string;
  openDeals: number;
  openTasks: number;
};

export type DeskClient = {
  id: string;
  name: string;
  initials: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  emailConsent: boolean;
  smsConsent: boolean;
  createdAt: string;
  openDeals: number;
  leadId: string | null;
  leadStage: LeadStage | null;
  leadStageLabel: string | null;
  leadStageColor: string | null;
};

export type PeopleDeskData = {
  admins: DeskMember[];
  staff: DeskMember[];
  clients: DeskClient[];
};

export function buildPeopleDesk({
  profiles,
  customers,
  leads,
  tasks,
  accounts,
}: {
  profiles: PeopleProfile[];
  customers: PeopleCustomer[];
  leads: PeopleLead[];
  tasks: PeopleTask[];
  accounts: Record<string, AuthAccount>;
}): PeopleDeskData {
  const leadsByAssignee = new Map<string, PeopleLead[]>();
  const leadsByCustomer = new Map<string, PeopleLead[]>();
  for (const lead of leads) {
    if (lead.assigned_to) {
      const list = leadsByAssignee.get(lead.assigned_to) ?? [];
      list.push(lead);
      leadsByAssignee.set(lead.assigned_to, list);
    }
    if (lead.customer_id) {
      const list = leadsByCustomer.get(lead.customer_id) ?? [];
      list.push(lead);
      leadsByCustomer.set(lead.customer_id, list);
    }
  }

  const tasksByAssignee = new Map<string, number>();
  for (const task of tasks) {
    if (!task.assigned_to || task.completed_at) continue;
    tasksByAssignee.set(task.assigned_to, (tasksByAssignee.get(task.assigned_to) ?? 0) + 1);
  }

  const members = profiles
    .filter((row) => isStaffRole(row.role))
    .map((row) => {
      const role = row.role as StaffRole;
      const name = row.full_name?.trim() || STAFF_ROLE_META[role].label;
      const assigned = leadsByAssignee.get(row.id) ?? [];
      const account = accounts[row.id];
      return {
        id: row.id,
        name,
        initials: initials(name),
        role,
        email: account?.email ?? null,
        lastSignInAt: account?.lastSignInAt ?? null,
        createdAt: row.created_at,
        openDeals: assigned.filter((lead) => OPEN_STAGES.has(lead.stage)).length,
        openTasks: tasksByAssignee.get(row.id) ?? 0,
      } satisfies DeskMember;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const clients = customers.map((row) => {
    const name = customerName(row);
    const related = [...(leadsByCustomer.get(row.id) ?? [])].sort((a, b) => {
      return new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime();
    });
    const latest = related[0];
    const stage = latest && isLeadStage(latest.stage) ? latest.stage : null;
    const location = [row.city, row.state].filter(Boolean).join(", ") || null;
    return {
      id: row.id,
      name,
      initials: initials(name === "Client" ? row.email || row.phone || "C" : name),
      email: row.email,
      phone: row.phone,
      location,
      emailConsent: row.email_consent,
      smsConsent: row.sms_consent,
      createdAt: row.created_at,
      openDeals: related.filter((lead) => OPEN_STAGES.has(lead.stage)).length,
      leadId: latest?.id ?? null,
      leadStage: stage,
      leadStageLabel: stage ? LEAD_STAGE_META[stage].label : null,
      leadStageColor: stage ? LEAD_STAGE_COLORS[stage] : null,
    } satisfies DeskClient;
  });

  return {
    admins: members.filter((row) => row.role === "admin"),
    staff: members.filter((row) => row.role !== "admin"),
    clients,
  };
}
