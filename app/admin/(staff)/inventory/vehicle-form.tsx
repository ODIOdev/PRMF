import { saveVehicle } from "./actions";

const fields = [
  ["vin", "VIN"],
  ["stock_number", "Stock"],
  ["year", "Year"],
  ["make", "Make"],
  ["model", "Model"],
  ["trim", "Trim"],
  ["msrp", "MSRP"],
  ["internet_price", "Internet price"],
] as const;

export function VehicleForm({
  vehicle,
}: {
  vehicle?: Record<string, string | number | null | undefined> & { id?: string };
}) {
  return (
    <form action={saveVehicle} className="grid gap-4 border border-chrome bg-white p-6 md:grid-cols-2">
      {vehicle?.id ? <input type="hidden" name="id" value={vehicle.id} /> : null}
      {fields.map(([name, label]) => (
        <label key={name} className="grid gap-1 text-sm">
          {label}
          <input
            name={name}
            defaultValue={vehicle?.[name] ?? ""}
            className="h-10 rounded-lg border px-3"
          />
        </label>
      ))}
      <label className="grid gap-1 text-sm">
        Brand
        <select name="brand" defaultValue={String(vehicle?.brand ?? "ford")} className="h-10 rounded-lg border px-3">
          <option value="ford">Ford</option>
          <option value="lincoln">Lincoln</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Condition
        <select name="condition" defaultValue={String(vehicle?.condition ?? "used")} className="h-10 rounded-lg border px-3">
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="cpo">CPO</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Status
        <select name="status" defaultValue={String(vehicle?.status ?? "in_stock")} className="h-10 rounded-lg border px-3">
          <option value="in_stock">In stock</option>
          <option value="in_transit">In transit</option>
          <option value="sold">Sold</option>
          <option value="hidden">Hidden</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">
        Description
        <textarea name="description" rows={4} defaultValue={String(vehicle?.description ?? "")} className="rounded-lg border px-3 py-2" />
      </label>
      <button className="h-10 rounded-lg bg-primary text-primary-foreground md:col-span-2">Save</button>
    </form>
  );
}
