import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addActivity } from "../../crm-actions";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("*, customers(*)")
    .eq("id", id)
    .maybeSingle();
  if (!lead) notFound();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });
  const customer = Array.isArray(lead.customers) ? lead.customers[0] : lead.customers;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="border border-chrome bg-white p-6">
        <h1 className="text-2xl font-semibold">
          {customer?.first_name} {customer?.last_name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {customer?.email} · {customer?.phone}
        </p>
        <p className="mt-4 text-sm">
          {lead.type} · {lead.stage} · {lead.brand}
        </p>
        <p className="mt-4 text-sm">{lead.message}</p>
      </div>
      <div className="border border-chrome bg-white p-6">
        <h2 className="font-semibold">Notes</h2>
        <form action={addActivity} className="mt-3 space-y-2">
          <input type="hidden" name="leadId" value={id} />
          <textarea name="body" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
          <button className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">Add note</button>
        </form>
        <ul className="mt-4 space-y-3 text-sm">
          {(activities ?? []).map((activity) => (
            <li key={activity.id} className="border-t pt-3">
              <p>{activity.body}</p>
              <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
