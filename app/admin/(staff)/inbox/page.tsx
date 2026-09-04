import Link from "next/link";
import { createDeskClient } from "@/lib/admin/session";
import { AdminPanel } from "@/components/admin/admin-panel";
import { titleCase } from "@/lib/format";

export default async function InboxPage() {
  const supabase = await createDeskClient();
  const { data } = await supabase
    .from("leads")
    .select("id, type, stage, source, message, created_at, customers(first_name, last_name, email, phone)")
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <AdminPanel>
      <ul>
        {(data ?? []).map((lead) => {
          const customer = Array.isArray(lead.customers) ? lead.customers[0] : lead.customers;
          return (
            <li key={lead.id} className="border-b border-chrome/70 last:border-0">
              <Link href={`/admin/leads/${lead.id}`} className="block px-4 py-3 hover:bg-[#f7f8fa]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {customer?.first_name} {customer?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                  {lead.type} · {titleCase(lead.stage)} · {lead.source?.replace("_", " ")}
                </p>
                {lead.message ? (
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{lead.message}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
      {(data ?? []).length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted-foreground">Inbox is empty.</p> : null}
    </AdminPanel>
  );
}
