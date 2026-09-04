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

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages as UIMessage[];
  const locale = body.locale === "es" ? "es" : "en";

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 24) {
    return Response.json({ error: "Invalid messages." }, { status: 400 });
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
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
