import { cn } from "@/lib/utils";

export function InventorySearch({
  brand = "",
  condition = "",
  q = "",
  submitLabel = "Search inventory",
  className,
}: {
  brand?: string;
  condition?: string;
  q?: string;
  submitLabel?: string;
  className?: string;
}) {
  return (
    <form
      action="/inventory"
      className={cn(
        "grid gap-3 border border-chrome/80 bg-white p-3 text-foreground md:grid-cols-4 md:p-4",
        className,
      )}
    >
      <select
        name="brand"
        defaultValue={brand}
        className="h-11 border border-input bg-white px-3 text-sm text-foreground"
      >
        <option value="">Any brand</option>
        <option value="ford">Ford</option>
        <option value="lincoln">Lincoln</option>
      </select>
      <select
        name="condition"
        defaultValue={condition}
        className="h-11 border border-input bg-white px-3 text-sm text-foreground"
      >
        <option value="">New and used</option>
        <option value="new">New</option>
        <option value="used">Used</option>
        <option value="cpo">Certified</option>
      </select>
      <input
        name="q"
        defaultValue={q}
        placeholder="Model, stock or VIN"
        className="h-11 border border-input bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground"
      />
      <button type="submit" className="h-11 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#002654]">
        {submitLabel}
      </button>
    </form>
  );
}
