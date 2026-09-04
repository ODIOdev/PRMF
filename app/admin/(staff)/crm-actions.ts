"use server";

import { createDeskClient, requireStaff } from "@/lib/admin/session";
import { revalidatePath } from "next/cache";

function revalidateDesk() {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/analytics");
}

export async function updateLeadStage(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const stage = String(formData.get("stage"));
  const supabase = await createDeskClient();
  await supabase.from("leads").update({ stage, updated_at: new Date().toISOString() }).eq("id", id);
  revalidateDesk();
}

export async function addActivity(formData: FormData) {
  await requireStaff();
  const leadId = String(formData.get("leadId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const supabase = await createDeskClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("activities").insert({
    lead_id: leadId,
    author_id: user?.id,
    type: "note",
    body,
  });
  revalidateDesk();
}

export async function createTask(formData: FormData) {
  await requireStaff();
  const supabase = await createDeskClient();
  await supabase.from("tasks").insert({
    title: String(formData.get("title") ?? "Follow up"),
    due_at: String(formData.get("due_at") || "") || null,
    lead_id: String(formData.get("lead_id") || "") || null,
    customer_id: String(formData.get("customer_id") || "") || null,
  });
  revalidateDesk();
}

export async function completeTask(formData: FormData) {
  await requireStaff();
  const supabase = await createDeskClient();
  await supabase
    .from("tasks")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", String(formData.get("id")));
  revalidateDesk();
}

export async function createCustomer(formData: FormData) {
  await requireStaff();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!firstName && !lastName && !email && !phone) return;
  const supabase = await createDeskClient();
  await supabase.from("customers").insert({
    first_name: firstName || null,
    last_name: lastName || null,
    email: email || null,
    phone: phone || null,
    email_consent: formData.get("email_consent") === "on",
    sms_consent: formData.get("sms_consent") === "on",
  });
  revalidateDesk();
}

export async function createAppointment(formData: FormData) {
  await requireStaff();
  const supabase = await createDeskClient();
  await supabase.from("appointments").insert({
    type: String(formData.get("type") || "test_drive"),
    starts_at: String(formData.get("starts_at")),
    notes: String(formData.get("notes") || "") || null,
    customer_id: String(formData.get("customer_id") || "") || null,
  });
  revalidateDesk();
}
