import { createDeskClient } from "@/lib/admin/session";
import { buildOverviewSnapshot } from "@/lib/admin/overview";
import { OverviewDashboard } from "@/components/admin/overview-dashboard";

export default async function AdminHomePage() {
  const supabase = await createDeskClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [{ data: vehicles }, { data: leads }, { data: tasks }, { data: appts }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, brand, status, condition, created_at, internet_price, msrp, year, make, model")
      .in("status", ["in_stock", "in_transit", "sold", "hidden"]),
    supabase.from("leads").select("id, stage, type, brand, created_at, customers(first_name, last_name)").order("created_at", { ascending: false }),
    supabase.from("tasks").select("id").is("completed_at", null),
    supabase
      .from("appointments")
      .select("id, type, starts_at")
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString())
      .order("starts_at"),
  ]);

  const data = buildOverviewSnapshot({
    vehicles: vehicles ?? [],
    leads: leads ?? [],
    openTasks: tasks?.length ?? 0,
    todayAppointments: appts ?? [],
  });

  return <OverviewDashboard data={data} />;
}
