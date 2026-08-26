import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateLeadStage } from "../crm-actions";

const stages = ["new", "contacted", "appointment", "proposal", "sold", "lost"] as const;

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, stage, type, brand, source, created_at, customers(first_name, last_name, email, phone)")
    .order("created_at", { ascending: false });

  const grouped = stages.map((stage) => ({
    stage,
    items: (data ?? []).filter((lead) => lead.stage === stage),
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Lead pipeline</h1>
      <div className="mt-6 grid gap-4 overflow-x-auto md:grid-cols-3 xl:grid-cols-6">
        {grouped.map((column) => (
          <div key={column.stage} className="rounded-2xl border bg-white p-3">
            <p className="mb-3 text-sm font-semibold capitalize">
              {column.stage} ({column.items.length})
            </p>
            <div className="space-y-3">
              {column.items.map((lead) => {
                const customer = Array.isArray(lead.customers) ? lead.customers[0] : lead.customers;
                return (
                  <div key={lead.id} className="rounded-xl border p-3 text-sm">
                    <p className="font-medium">
                      {customer?.first_name} {customer?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lead.type} · {lead.brand ?? "—"}
                    </p>
                    <form action={updateLeadStage} className="mt-2">
                      <input type="hidden" name="id" value={lead.id} />
                      <select name="stage" defaultValue={lead.stage} className="w-full rounded border px-2 py-1 text-xs">
                        {stages.map((stage) => (
                          <option key={stage}>{stage}</option>
                        ))}
                      </select>
                      <button className="mt-1 text-xs text-primary">Update</button>
                    </form>
                    <Link href={`/admin/leads/${lead.id}`} className="mt-2 inline-block text-xs underline">
                      Open
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
