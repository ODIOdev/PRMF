import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("id, vin, year, make, model, brand, status, internet_price, stock_number")
    .order("updated_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <Link href="/admin/inventory/new" className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add vehicle
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto border border-chrome bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted">
            <tr>
              <th className="px-3 py-2">Vehicle</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Brand</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <Link href={`/admin/inventory/${row.id}`} className="font-medium hover:underline">
                    {row.year} {row.make} {row.model}
                  </Link>
                  <div className="text-xs text-muted-foreground">{row.vin}</div>
                </td>
                <td className="px-3 py-2">{row.stock_number}</td>
                <td className="px-3 py-2 capitalize">{row.brand}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">{row.internet_price ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
