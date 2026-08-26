"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLeadStage(formData: FormData) {
  const id = String(formData.get("id"));
  const stage = String(formData.get("stage"));
  const supabase = await createClient();
  await supabase.from("leads").update({ stage, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function addActivity(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("activities").insert({
    lead_id: leadId,
    author_id: user?.id,
    type: "note",
    body,
  });
  revalidatePath("/admin/leads");
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("tasks").insert({
    title: String(formData.get("title") ?? "Follow up"),
    due_at: String(formData.get("due_at") || "") || null,
    lead_id: String(formData.get("lead_id") || "") || null,
    customer_id: String(formData.get("customer_id") || "") || null,
  });
  revalidatePath("/admin/tasks");
}

export async function completeTask(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/tasks");
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("appointments").insert({
    type: String(formData.get("type") || "test_drive"),
    starts_at: String(formData.get("starts_at")),
    notes: String(formData.get("notes") || "") || null,
    customer_id: String(formData.get("customer_id") || "") || null,
  });
  revalidatePath("/admin/appointments");
}
