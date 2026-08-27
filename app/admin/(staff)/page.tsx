import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [{ count: vehicles }, { count: leads }, { data: stages }, { data: tasks }] = await Promise.all([
    supabase.from("vehicles").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("stage, brand"),
    supabase.from("tasks").select("id, completed_at").is("completed_at", null),
  ]);

  const byStage = (stages ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.stage] = (acc[row.stage] ?? 0) + 1;
    return acc;
  }, {});
  const byBrand = (stages ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = row.brand ?? "unspecified";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Vehicles" value={vehicles ?? 0} />
        <Stat label="Leads" value={leads ?? 0} />
        <Stat label="Open tasks" value={tasks?.length ?? 0} />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="border border-chrome bg-white p-5">
          <h2 className="font-semibold">Leads by stage</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(byStage).map(([stage, count]) => (
              <li key={stage} className="flex justify-between">
                <span className="capitalize">{stage}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-chrome bg-white p-5">
          <h2 className="font-semibold">Leads by brand</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(byBrand).map(([brand, count]) => (
              <li key={brand} className="flex justify-between">
                <span className="capitalize">{brand}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-chrome bg-white p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
