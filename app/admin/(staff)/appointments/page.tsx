import { createClient } from "@/lib/supabase/server";
import { createAppointment } from "../crm-actions";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("appointments").select("*").order("starts_at", { ascending: true });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Appointments</h1>
      <form action={createAppointment} className="mt-6 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-4">
        <select name="type" className="h-10 rounded-lg border px-3">
          <option value="test_drive">Test drive</option>
          <option value="service">Service</option>
          <option value="delivery">Delivery</option>
        </select>
        <input name="starts_at" type="datetime-local" required className="h-10 rounded-lg border px-3" />
        <input name="notes" placeholder="Notes" className="h-10 rounded-lg border px-3" />
        <button className="h-10 rounded-lg bg-primary text-primary-foreground">Schedule</button>
      </form>
      <ul className="mt-6 space-y-3">
        {(data ?? []).map((row) => (
          <li key={row.id} className="rounded-xl border bg-white px-4 py-3 text-sm">
            <p className="font-medium capitalize">{row.type.replace("_", " ")}</p>
            <p className="text-muted-foreground">{new Date(row.starts_at).toLocaleString()}</p>
            {row.notes ? <p className="mt-1">{row.notes}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
