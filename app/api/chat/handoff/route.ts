import { createAdminClient } from "@/lib/supabase/admin";
import { attachChatContact, chatTranscript, getChatThread, isVisitorKey } from "@/lib/support-inbox";

function leadTypeFromIntent(intent: string) {
  if (intent === "service") return "service";
  if (intent === "appointment") return "sales";
  return "sales";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid." }, { status: 400 });
  const visitorKey = typeof body.visitorKey === "string" ? body.visitorKey : "";
  const threadId = typeof body.threadId === "string" ? body.threadId : "";
  const firstName = String(body.firstName ?? "").trim().slice(0, 40);
  const lastName = String(body.lastName ?? "").trim().slice(0, 40);
  const email = String(body.email ?? "").trim().slice(0, 80);
  const phone = String(body.phone ?? "").trim().slice(0, 30);
  if (!isVisitorKey(visitorKey) || !threadId || !firstName || !phone || !email) {
    return Response.json({ error: "incomplete" }, { status: 400 });
  }

  const thread = await getChatThread(threadId, visitorKey);
  if (!thread) return Response.json({ error: "Not found." }, { status: 404 });

  const supabase = createAdminClient();
  const transcript = chatTranscript(thread);
  const { data, error } = await supabase.rpc("submit_lead", {
    p_first_name: firstName,
    p_last_name: lastName,
    p_email: email,
    p_phone: phone,
    p_message: `[chat]\nIntent: ${thread.intent}\n\n${transcript}`.slice(0, 4000),
    p_type: leadTypeFromIntent(thread.intent),
    p_brand: null,
    p_vehicle_id: null,
    p_email_consent: true,
    p_sms_consent: true,
  });
  if (error) return Response.json({ error: "send_failed" }, { status: 500 });

  const leadId = typeof data === "string" ? data : null;
  await attachChatContact(threadId, visitorKey, { firstName, lastName, email, phone, leadId });
  return Response.json({ ok: true, leadId });
}
