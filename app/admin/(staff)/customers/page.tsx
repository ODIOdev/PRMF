import { createAdminClient } from "@/lib/supabase/admin";
import { createDeskClient } from "@/lib/admin/session";
import { PeopleDesk } from "@/components/admin/people-desk";
import { buildPeopleDesk, type AuthAccount, type PeopleCustomer, type PeopleLead, type PeopleProfile, type PeopleTask } from "@/lib/admin/people";

async function loadAuthAccounts() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    const accounts: Record<string, AuthAccount> = {};
    for (const user of data.users) {
      accounts[user.id] = {
        email: user.email ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      };
    }
    return accounts;
  } catch {
    return {};
  }
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const supabase = await createDeskClient();
  const [{ data: profiles }, { data: customers }, { data: leads }, { data: tasks }, accounts] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: true }),
    supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, city, state, email_consent, sms_consent, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("leads").select("id, customer_id, assigned_to, stage, type, created_at, updated_at"),
    supabase.from("tasks").select("id, assigned_to, customer_id, completed_at"),
    loadAuthAccounts(),
  ]);

  const data = buildPeopleDesk({
    profiles: (profiles ?? []) as PeopleProfile[],
    customers: (customers ?? []) as PeopleCustomer[],
    leads: (leads ?? []) as PeopleLead[],
    tasks: (tasks ?? []) as PeopleTask[],
    accounts,
  });

  return <PeopleDesk data={data} view={view} />;
}
