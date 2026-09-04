import { createDeskClient } from "@/lib/admin/session";
import { addActivity } from "../../crm-actions";
import { notFound } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";
import { titleCase } from "@/lib/format";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createDeskClient();
  const { data: lead } = await supabase.from("leads").select("*, customers(*)").eq("id", id).maybeSingle();
  if (!lead) notFound();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });
  const customer = Array.isArray(lead.customers) ? lead.customers[0] : lead.customers;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AdminPanel className="p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
          {titleCase(lead.type)} · {titleCase(lead.stage)}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {customer?.first_name} {customer?.last_name}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {customer?.email} · {customer?.phone}
        </p>
        {lead.brand ? <p className="mt-3 text-sm capitalize">{lead.brand}</p> : null}
        {lead.message ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{lead.message}</p> : null}
      </AdminPanel>
      <AdminPanel className="p-6">
        <h2 className="font-semibold tracking-tight">Notes</h2>
        <form action={addActivity} className="mt-3 space-y-2">
          <input type="hidden" name="leadId" value={id} />
          <textarea name="body" rows={3} className="w-full border border-input bg-white px-3 py-2 text-sm" />
          <button className="h-10 bg-ford px-4 text-sm font-medium text-white hover:bg-ford-bright">Add note</button>
        </form>
        <ul className="mt-4 space-y-3 text-sm">
          {(activities ?? []).map((activity) => (
            <li key={activity.id} className="border-t border-chrome pt-3">
              <p>{activity.body}</p>
              <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
