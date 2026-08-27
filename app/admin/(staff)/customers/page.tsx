import { createClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Customers</h1>
      <div className="mt-6 overflow-x-auto border border-chrome bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Email consent</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-b">
                <td className="px-3 py-2">
                  {row.first_name} {row.last_name}
                </td>
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2">{row.phone}</td>
                <td className="px-3 py-2">{row.email_consent ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
