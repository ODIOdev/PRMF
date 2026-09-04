import { createDeskClient } from "@/lib/admin/session";
import { AppointmentsDesk } from "@/components/admin/appointments-desk";
import type { DeskAppointment, DeskCustomer, DeskLead } from "@/lib/admin/appointments";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; when?: string; day?: string }>;
}) {
  const { type, when, day } = await searchParams;
  const supabase = await createDeskClient();
  const [{ data: appointments }, { data: waitingLeads }, { data: customers }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, type, starts_at, notes, customer_id, vehicle_id, customers(id, first_name, last_name, email, phone)")
      .order("starts_at", { ascending: true }),
    supabase
      .from("leads")
      .select("id, type, brand, created_at, customers(first_name, last_name, phone)")
      .eq("stage", "appointment")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("customers").select("id, first_name, last_name, phone").order("created_at", { ascending: false }).limit(80),
  ]);

  return (
    <AppointmentsDesk
      appointments={(appointments ?? []) as DeskAppointment[]}
      waitingLeads={(waitingLeads ?? []) as DeskLead[]}
      customers={(customers ?? []) as DeskCustomer[]}
      activeType={type}
      activeWhen={when}
      activeDay={day}
    />
  );
}
