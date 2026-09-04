"use server";

import { revalidatePath } from "next/cache";
import { createDeskClient, requireStaff } from "@/lib/admin/session";
import { upsertChatThread } from "@/lib/support-inbox";

function refreshInbox() {
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/customers");
}

export async function replyInboxChat(formData: FormData) {
  await requireStaff();
  const threadId = String(formData.get("threadId") ?? "");
  const visitorKey = String(formData.get("visitorKey") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!threadId || !visitorKey || !body) return;
  await upsertChatThread({ threadId, visitorKey, role: "staff", body });
  const leadId = String(formData.get("leadId") ?? "");
  if (leadId) {
    const supabase = await createDeskClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("activities").insert({
      lead_id: leadId,
      author_id: user?.id,
      type: "note",
      body: `Desk chat: ${body}`,
    });
  }
  refreshInbox();
}

export async function logInboxContact(formData: FormData) {
  await requireStaff();
  const leadId = String(formData.get("leadId") ?? "");
  const type = String(formData.get("type") ?? "note");
  const body = String(formData.get("body") ?? "").trim();
  if (!leadId || !body) return;
  const allowed = type === "call" || type === "email" || type === "sms" || type === "note";
  const supabase = await createDeskClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("activities").insert({
    lead_id: leadId,
    author_id: user?.id,
    type: allowed ? type : "note",
    body,
  });
  if (type !== "note") {
    await supabase.from("leads").update({ stage: "contacted", updated_at: new Date().toISOString() }).eq("id", leadId).eq("stage", "new");
  }
  refreshInbox();
}
