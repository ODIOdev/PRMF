import { createDeskClient } from "@/lib/admin/session";
import { AdminPanel } from "@/components/admin/admin-panel";

export default async function CustomersPage() {
  const supabase = await createDeskClient();
  const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });

  return (
    <AdminPanel className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-chrome bg-[#f7f8fa] text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-3 py-2.5">Name</th>
            <th className="px-3 py-2.5">Email</th>
            <th className="px-3 py-2.5">Phone</th>
            <th className="px-3 py-2.5">Consent</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-b border-chrome/70 last:border-0">
              <td className="px-3 py-2.5 font-medium">
                {row.first_name} {row.last_name}
              </td>
              <td className="px-3 py-2.5">{row.email}</td>
              <td className="px-3 py-2.5">{row.phone}</td>
              <td className="px-3 py-2.5 text-muted-foreground">{row.email_consent ? "Email" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(data ?? []).length === 0 ? <p className="px-3 py-8 text-center text-sm text-muted-foreground">No customers yet.</p> : null}
    </AdminPanel>
  );
}
