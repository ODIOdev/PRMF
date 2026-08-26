"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveVehicle(formData: FormData) {
  const id = String(formData.get("id") ?? "");
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
    msrp: Number(formData.get("msrp") || 0) || null,
    internet_price: Number(formData.get("internet_price") || 0) || null,
    description: String(formData.get("description") || "") || null,
    updated_at: new Date().toISOString(),
  };
  const supabase = await createClient();
  if (id) {
    await supabase.from("vehicles").update(payload).eq("id", id);
    redirect(`/admin/inventory/${id}`);
  }
  const { data } = await supabase.from("vehicles").insert(payload).select("id").single();
  redirect(`/admin/inventory/${data?.id ?? ""}`);
}
