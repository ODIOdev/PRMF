import { getChatThread, isVisitorKey } from "@/lib/support-inbox";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const visitorKey = url.searchParams.get("visitor") ?? "";
  if (!id || !isVisitorKey(visitorKey)) {
    return Response.json({ error: "Missing thread." }, { status: 400 });
  }
  const thread = await getChatThread(id, visitorKey).catch(() => null);
  if (!thread) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({
    id: thread.id,
    status: thread.status,
    intent: thread.intent,
    contact: thread.contact,
    messages: thread.messages.map((row) => ({
      id: row.id,
      role: row.role,
      body: row.body,
      at: row.at,
    })),
  });
}
