"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { saveVehicle } from "./actions";
import { vehicleCallForPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const fields = [
  ["vin", "VIN"],
  ["stock_number", "Stock"],
  ["year", "Year"],
  ["make", "Make"],
  ["model", "Model"],
  ["trim", "Trim"],
] as const;

type GalleryImage = { id: string; url: string; sort_order?: number };
type PendingImage = { key: string; file: File; url: string };

export function VehicleForm({
  vehicle,
}: {
  vehicle?: Record<string, string | number | null | undefined> & {
    id?: string;
    features?: unknown;
    call_for_price?: boolean | null;
    vehicle_images?: GalleryImage[] | null;
  };
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [existing, setExisting] = useState<GalleryImage[]>(() =>
    [...(vehicle?.vehicle_images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  );
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [dragging, setDragging] = useState(false);

  function addFiles(list: FileList | File[]) {
    const next = [...pending];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith("image/")) continue;
      next.push({ key: crypto.randomUUID(), file, url: URL.createObjectURL(file) });
    }
    setPending(next.slice(0, 24));
  }

  function removePending(key: string) {
    setPending((rows) => {
      const row = rows.find((item) => item.key === key);
      if (row) URL.revokeObjectURL(row.url);
      return rows.filter((item) => item.key !== key);
    });
  }

  async function submit(formData: FormData) {
    for (const image of existing) formData.append("keep", image.id);
    for (const image of pending) formData.append("photos", image.file);
    await saveVehicle(formData);
  }

  const total = existing.length + pending.length;

  return (
    <form action={submit} className="grid gap-4 border border-chrome bg-white p-6 md:grid-cols-2">
      {vehicle?.id ? <input type="hidden" name="id" value={vehicle.id} /> : null}
      {fields.map(([name, label]) => (
        <label key={name} className="grid gap-1 text-sm">
          {label}
          <input name={name} defaultValue={vehicle?.[name] ?? ""} className="h-10 border border-input bg-white px-3" />
        </label>
      ))}
      <MoneyField name="msrp" label="MSRP" defaultValue={vehicle?.msrp} />
      <InternetPriceField
        defaultValue={vehicle?.internet_price}
        defaultCallForPrice={vehicleCallForPrice(vehicle)}
      />
      <label className="grid gap-1 text-sm">
        Brand
        <select name="brand" defaultValue={String(vehicle?.brand ?? "ford")} className="h-10 border border-input bg-white px-3">
          <option value="ford">Ford</option>
          <option value="lincoln">Lincoln</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Condition
        <select name="condition" defaultValue={String(vehicle?.condition ?? "used")} className="h-10 border border-input bg-white px-3">
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="cpo">CPO</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Status
        <select name="status" defaultValue={String(vehicle?.status ?? "in_stock")} className="h-10 border border-input bg-white px-3">
          <option value="in_stock">In stock</option>
          <option value="in_transit">In transit</option>
          <option value="sold">Sold</option>
          <option value="hidden">Hidden</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">
        Description
        <textarea name="description" rows={4} defaultValue={String(vehicle?.description ?? "")} className="border border-input bg-white px-3 py-2" />
      </label>

      <div className="md:col-span-2">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">Photo gallery</p>
          <p className="text-xs text-muted-foreground">{total} photo{total === 1 ? "" : "s"} · first is the cover</p>
        </div>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
          }}
          className={cn(
            "border border-dashed p-3",
            dragging ? "border-ford bg-[#eef4fb]" : "border-chrome bg-[#f7f8fa]",
          )}
        >
          {total > 0 ? (
            <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {existing.map((image, index) => (
                <li key={image.id} className="relative aspect-[4/3] overflow-hidden border border-chrome bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="" className="size-full object-cover" />
                  {index === 0 ? <CoverBadge /> : null}
                  <button
                    type="button"
                    onClick={() => setExisting((rows) => rows.filter((row) => row.id !== image.id))}
                    className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center bg-white/90 text-foreground hover:bg-white"
                    aria-label="Remove photo"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
              {pending.map((image, index) => (
                <li key={image.key} className="relative aspect-[4/3] overflow-hidden border border-chrome bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="" className="size-full object-cover" />
                  {existing.length === 0 && index === 0 ? <CoverBadge /> : null}
                  <button
                    type="button"
                    onClick={() => removePending(image.key)}
                    className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center bg-white/90 text-foreground hover:bg-white"
                    aria-label="Remove photo"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-1 py-8 text-sm text-muted-foreground hover:text-ford"
          >
            <ImagePlus className="size-6" />
            <span className="font-medium text-foreground">Add images</span>
            <span className="text-xs">Drop photos here, or click to upload</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.length) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <button className="h-10 bg-ford text-sm font-medium text-white hover:bg-ford-bright md:col-span-2">Save</button>
    </form>
  );
}

function formatMoneyDisplay(value: string | number | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function MoneyField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
}) {
  const [display, setDisplay] = useState(() => formatMoneyDisplay(defaultValue));
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <span className="relative block">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">$</span>
        <input
          name={name}
          value={display}
          onChange={(event) => setDisplay(formatMoneyDisplay(event.target.value))}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          className="h-10 w-full border border-input bg-white px-3 pl-7 tabular-nums"
        />
      </span>
    </label>
  );
}

function InternetPriceField({
  defaultValue,
  defaultCallForPrice,
}: {
  defaultValue?: string | number | null;
  defaultCallForPrice: boolean;
}) {
  const [display, setDisplay] = useState(() => formatMoneyDisplay(defaultValue));
  const [callForPrice, setCallForPrice] = useState(defaultCallForPrice);

  return (
    <div className="grid gap-1 text-sm">
      <span>Internet price</span>
      <span className="relative block">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">$</span>
        <input
          name="internet_price"
          value={display}
          onChange={(event) => setDisplay(formatMoneyDisplay(event.target.value))}
          readOnly={callForPrice}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          className={cn(
            "h-10 w-full border border-input bg-white px-3 pl-7 tabular-nums",
            callForPrice && "bg-[#f7f8fa] text-muted-foreground",
          )}
        />
      </span>
      <input type="hidden" name="call_for_price" value={callForPrice ? "1" : "0"} />
      <label className="mt-1 flex cursor-pointer items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={callForPrice}
          onChange={(event) => setCallForPrice(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 border border-input accent-ford"
        />
        <span>
          <span className="font-medium">Call for price</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Shoppers see “Call for price” instead of an internet price. MSRP can stay on file.
          </span>
        </span>
      </label>
    </div>
  );
}

function CoverBadge() {
  return (
    <span className="absolute bottom-1.5 left-1.5 bg-ford px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
      Cover
    </span>
  );
}
