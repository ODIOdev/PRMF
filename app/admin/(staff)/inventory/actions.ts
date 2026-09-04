"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { withCallForPrice } from "@/lib/format";
import { createDeskClient, requireStaff } from "@/lib/admin/session";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 24;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function extensionFor(type: string, name: string) {
  const fromName = name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/avif") return "avif";
  return "jpg";
}

async function saveGallery(
  supabase: Awaited<ReturnType<typeof createDeskClient>>,
  vehicleId: string,
  formData: FormData,
) {
  const keep = formData.getAll("keep").map(String).filter(Boolean);
  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, MAX_FILES);

  const { data: current } = await supabase
    .from("vehicle_images")
    .select("id, url")
    .eq("vehicle_id", vehicleId)
    .order("sort_order");
  const rows = current ?? [];
  const keepSet = new Set(keep);
  const removed = rows.filter((row) => !keepSet.has(row.id));

  if (removed.length) {
    await supabase.from("vehicle_images").delete().in(
      "id",
      removed.map((row) => row.id),
    );
    const storagePaths = removed
      .map((row) => {
        const marker = "/vehicle-photos/";
        const index = row.url.indexOf(marker);
        return index >= 0 ? decodeURIComponent(row.url.slice(index + marker.length)) : null;
      })
      .filter((path): path is string => Boolean(path));
    if (storagePaths.length) {
      await supabase.storage.from("vehicle-photos").remove(storagePaths);
    }
  }

  const keptRows = keep
    .map((id) => rows.find((row) => row.id === id))
    .filter((row): row is (typeof rows)[number] => Boolean(row));
  await Promise.all(
    keptRows.map((row, index) =>
      supabase.from("vehicle_images").update({ sort_order: index }).eq("id", row.id),
    ),
  );

  let sort = keptRows.length;
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_BYTES) continue;
    const path = `${vehicleId}/${crypto.randomUUID()}.${extensionFor(file.type, file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from("vehicle-photos").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (error) continue;
    const { data } = supabase.storage.from("vehicle-photos").getPublicUrl(path);
    await supabase.from("vehicle_images").insert({
      vehicle_id: vehicleId,
      url: data.publicUrl,
      alt: file.name.replace(/\.[^.]+$/, "") || null,
      sort_order: sort,
    });
    sort += 1;
  }
}

function parseMoney(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").replace(/[^0-9.]/g, "");
  if (!raw) return null;
  const amount = Number(raw);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
}

export async function saveVehicle(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const supabase = await createDeskClient();
  let currentFeatures: unknown = [];
  if (id) {
    const { data } = await supabase.from("vehicles").select("features").eq("id", id).maybeSingle();
    currentFeatures = data?.features;
  }
  const payload = {
    vin: String(formData.get("vin") || "") || null,
    stock_number: String(formData.get("stock_number") || "") || null,
    brand: String(formData.get("brand") || "other"),
    condition: String(formData.get("condition") || "used"),
    status: String(formData.get("status") || "in_stock"),
    year: Number(formData.get("year") || 0) || null,
    make: String(formData.get("make") || "") || null,
    model: String(formData.get("model") || "") || null,
    trim: String(formData.get("trim") || "") || null,
    msrp: parseMoney(formData.get("msrp")),
    internet_price: parseMoney(formData.get("internet_price")),
    features: withCallForPrice(currentFeatures, String(formData.get("call_for_price")) === "1"),
    description: String(formData.get("description") || "") || null,
    updated_at: new Date().toISOString(),
  };
  let vehicleId = id;
  if (id) {
    await supabase.from("vehicles").update(payload).eq("id", id);
  } else {
    const { data } = await supabase.from("vehicles").insert(payload).select("id").single();
    vehicleId = data?.id ?? "";
  }
  if (vehicleId) await saveGallery(supabase, vehicleId, formData);
  revalidatePath("/admin/inventory");
  revalidatePath("/inventory");
  redirect(`/admin/inventory/${vehicleId}`);
}
