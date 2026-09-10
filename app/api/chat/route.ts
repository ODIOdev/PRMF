import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import {
  supportInstructions,
  supportModel,
  supportStopWhen,
  supportTools,
} from "@/lib/support";
import { isVisitorKey, upsertChatThread } from "@/lib/support-inbox";

export const maxDuration = 30;

function lastUserText(messages: UIMessage[]) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]!;
    if (message.role !== "user") continue;
    return message.parts
      .filter((part) => part.type === "text" && "text" in part && part.text)
      .map((part) => (part as { text: string }).text)
      .join("")
      .trim();
  }
  return "";
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages as UIMessage[];
  const locale = body.locale === "es" ? "es" : "en";
  const visitorKey = typeof body.visitorKey === "string" ? body.visitorKey : "";
  const threadId = typeof body.threadId === "string" ? body.threadId : undefined;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 24) {
    return Response.json({ error: "Invalid messages." }, { status: 400 });
  }

  let savedId = threadId;
  if (isVisitorKey(visitorKey)) {
    const text = lastUserText(messages);
    if (text) {
      try {
        const thread = await upsertChatThread({
          threadId,
          visitorKey,
          locale,
          role: "visitor",
          body: text,
        });
        savedId = thread?.id ?? threadId;
      } catch {
        savedId = threadId;
      }
    }
  }

  const result = streamText({
    model: supportModel,
    instructions:
      locale === "es"
        ? `${supportInstructions}\n\nAlways reply in Spanish. Use a professional, clear tone appropriate for a New York dealership. Keep vehicle names, VINs, and street addresses in their original form.`
        : supportInstructions,
    messages: await convertToModelMessages(messages, { tools: supportTools }),
    tools: supportTools,
    stopWhen: supportStopWhen,
    maxOutputTokens: 700,
    providerOptions: {
      gateway: {
        models: ["openai/gpt-4o-mini", "anthropic/claude-haiku-4.5"],
        tags: ["feature:support-chat"],
      },
    },
    async onFinish({ text }) {
      const reply = text.trim();
      if (!reply || !isVisitorKey(visitorKey) || !savedId) return;
      try {
        await upsertChatThread({
          threadId: savedId,
          visitorKey,
          locale,
          role: "assist",
          body: reply,
          unreadForDesk: false,
        });
      } catch {
        /* chat reply still streams if inbox persistence is down */
      }
    },
  });

  const headers = new Headers();
  if (savedId) headers.set("x-thread-id", savedId);

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
    headers,
  });
}
