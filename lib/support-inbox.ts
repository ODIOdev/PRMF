import { createAdminClient } from "@/lib/supabase/admin";

export const SUPPORT_CHATS_KEY = "support_chats";
export const MAX_CHAT_THREADS = 80;
export const MAX_CHAT_MESSAGES = 40;

export const CHAT_INTENTS = ["sales", "service", "appointment", "general"] as const;
export type ChatIntent = (typeof CHAT_INTENTS)[number];
export const CHAT_STATUSES = ["open", "waiting", "handed_off", "closed"] as const;
export type ChatStatus = (typeof CHAT_STATUSES)[number];
export const CHAT_ROLES = ["visitor", "assist", "staff"] as const;
export type ChatRole = (typeof CHAT_ROLES)[number];

export type ChatMessage = {
  id: string;
  role: ChatRole;
  body: string;
  at: string;
};

export type ChatContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leadId: string | null;
};

export type ChatThread = {
  id: string;
  visitorKey: string;
  locale: "en" | "es";
  intent: ChatIntent;
  status: ChatStatus;
  unread: boolean;
  contact: ChatContact | null;
  preview: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

function isIntent(value: unknown): value is ChatIntent {
  return CHAT_INTENTS.includes(value as ChatIntent);
}

function isStatus(value: unknown): value is ChatStatus {
  return CHAT_STATUSES.includes(value as ChatStatus);
}

function isRole(value: unknown): value is ChatRole {
  return CHAT_ROLES.includes(value as ChatRole);
}

export function isVisitorKey(value: string | undefined): value is string {
  return Boolean(value && /^[a-zA-Z0-9-]{8,80}$/.test(value));
}

export function inferChatIntent(text: string, current: ChatIntent = "general"): ChatIntent {
  const value = text.toLowerCase();
  if (/appoint|schedule|test drive|book a|visit the|showroom/.test(value)) return "appointment";
  if (/service|oil change|brake|tire|repair|inspection|warranty|parts/.test(value)) return "service";
  if (/price|inventory|in stock|f-?150|explorer|lincoln|navigator|financ|trade|lease/.test(value)) return "sales";
  return current;
}

export function chatTranscript(thread: ChatThread) {
  return thread.messages
    .map((row) => `${row.role === "visitor" ? "Customer" : row.role === "staff" ? "Desk" : "Assist"}: ${row.body}`)
    .join("\n");
}

function readMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const body = typeof row.body === "string" ? row.body.trim().slice(0, 2000) : "";
  if (!body || !isRole(row.role)) return null;
  return {
    id: typeof row.id === "string" ? row.id.slice(0, 40) : crypto.randomUUID(),
    role: row.role,
    body,
    at: typeof row.at === "string" ? row.at : new Date().toISOString(),
  };
}

function readContact(value: unknown): ChatContact | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const firstName = typeof row.firstName === "string" ? row.firstName.trim().slice(0, 40) : "";
  const lastName = typeof row.lastName === "string" ? row.lastName.trim().slice(0, 40) : "";
  const email = typeof row.email === "string" ? row.email.trim().slice(0, 80) : "";
  const phone = typeof row.phone === "string" ? row.phone.trim().slice(0, 30) : "";
  if (!firstName && !email && !phone) return null;
  return {
    firstName,
    lastName,
    email,
    phone,
    leadId: typeof row.leadId === "string" ? row.leadId : null,
  };
}

function readThread(value: unknown): ChatThread | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.slice(0, 40) : "";
  const visitorKey = typeof row.visitorKey === "string" ? row.visitorKey : "";
  if (!id || !isVisitorKey(visitorKey)) return null;
  const messages = Array.isArray(row.messages)
    ? row.messages.map(readMessage).filter((item): item is ChatMessage => Boolean(item)).slice(-MAX_CHAT_MESSAGES)
    : [];
  const preview = typeof row.preview === "string" ? row.preview : (messages.at(-1)?.body ?? "");
  return {
    id,
    visitorKey,
    locale: row.locale === "es" ? "es" : "en",
    intent: isIntent(row.intent) ? row.intent : "general",
    status: isStatus(row.status) ? row.status : "open",
    unread: row.unread !== false,
    contact: readContact(row.contact),
    preview: preview.trim().slice(0, 180),
    messages,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
  };
}

export function parseChatThreads(value: unknown): ChatThread[] {
  const list = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { threads?: unknown }).threads)
    ? (value as { threads: unknown[] }).threads
    : [];
  return list.map(readThread).filter((item): item is ChatThread => Boolean(item)).slice(0, MAX_CHAT_THREADS);
}

async function loadThreads(): Promise<ChatThread[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("site_settings").select("value").eq("key", SUPPORT_CHATS_KEY).maybeSingle();
    return parseChatThreads(data?.value);
  } catch {
    return [];
  }
}

function mergeThreads(local: ChatThread[], remote: ChatThread[]) {
  const map = new Map<string, ChatThread>();
  for (const row of [...remote, ...local]) {
    const existing = map.get(row.id);
    if (!existing) {
      map.set(row.id, row);
      continue;
    }
    const messages = new Map<string, ChatMessage>();
    for (const message of existing.messages) messages.set(message.id, message);
    for (const message of row.messages) messages.set(message.id, message);
    const mergedMessages = [...messages.values()]
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
      .slice(-MAX_CHAT_MESSAGES);
    const newer = new Date(row.updatedAt).getTime() >= new Date(existing.updatedAt).getTime() ? row : existing;
    map.set(row.id, {
      ...newer,
      messages: mergedMessages,
      preview: (mergedMessages.at(-1)?.body ?? newer.preview).slice(0, 180),
      unread: newer.unread,
      contact: row.contact ?? existing.contact,
      updatedAt:
        new Date(row.updatedAt).getTime() >= new Date(existing.updatedAt).getTime() ? row.updatedAt : existing.updatedAt,
    });
  }
  return [...map.values()]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_CHAT_THREADS);
}

async function saveThreads(threads: ChatThread[]) {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("site_settings").select("value").eq("key", SUPPORT_CHATS_KEY).maybeSingle();
    const merged = mergeThreads(threads, parseChatThreads(data?.value));
    const { error } = await supabase.from("site_settings").upsert({
      key: SUPPORT_CHATS_KEY,
      value: { threads: merged },
      updated_at: new Date().toISOString(),
    });
    if (error) return threads;
    return merged;
  } catch {
    return threads;
  }
}

export async function listChatThreads() {
  return loadThreads();
}

export async function getChatThread(id: string, visitorKey?: string) {
  const threads = await loadThreads();
  const thread = threads.find((row) => row.id === id);
  if (!thread) return null;
  if (visitorKey && thread.visitorKey !== visitorKey) return null;
  return thread;
}

export async function upsertChatThread(input: {
  threadId?: string;
  visitorKey: string;
  locale?: "en" | "es";
  role: ChatRole;
  body: string;
  unreadForDesk?: boolean;
}) {
  const body = input.body.trim().slice(0, 2000);
  if (!body || !isVisitorKey(input.visitorKey)) return null;
  const threads = await loadThreads();
  const now = new Date().toISOString();
  let thread = input.threadId ? threads.find((row) => row.id === input.threadId && row.visitorKey === input.visitorKey) : undefined;
  if (!thread) {
    thread = {
      id: crypto.randomUUID(),
      visitorKey: input.visitorKey,
      locale: input.locale ?? "en",
      intent: inferChatIntent(body),
      status: "open",
      unread: input.role === "visitor",
      contact: null,
      preview: body.slice(0, 180),
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    threads.unshift(thread);
  }
  if (input.role === "visitor") {
    thread.intent = inferChatIntent(body, thread.intent);
    thread.status = thread.contact ? "handed_off" : "waiting";
    thread.unread = input.unreadForDesk !== false;
  } else if (input.role === "staff") {
    thread.status = thread.contact ? "handed_off" : "open";
    thread.unread = false;
  }
  const last = thread.messages.at(-1);
  if (last && last.role === input.role && last.body === body) return thread;
  thread.messages = [
    ...thread.messages,
    { id: crypto.randomUUID(), role: input.role, body, at: now },
  ].slice(-MAX_CHAT_MESSAGES);
  thread.preview = body.slice(0, 180);
  thread.updatedAt = now;
  await saveThreads(threads);
  return thread;
}

export async function attachChatContact(threadId: string, visitorKey: string, contact: ChatContact) {
  const threads = await loadThreads();
  const thread = threads.find((row) => row.id === threadId && row.visitorKey === visitorKey);
  if (!thread) return null;
  thread.contact = contact;
  thread.status = "handed_off";
  thread.unread = true;
  thread.updatedAt = new Date().toISOString();
  await saveThreads(threads);
  return thread;
}

export async function markChatRead(threadId: string) {
  const threads = await loadThreads();
  const thread = threads.find((row) => row.id === threadId);
  if (!thread || !thread.unread) return thread ?? null;
  thread.unread = false;
  await saveThreads(threads);
  return thread;
}

export async function setChatLeadId(threadId: string, leadId: string) {
  const threads = await loadThreads();
  const thread = threads.find((row) => row.id === threadId);
  if (!thread) return null;
  thread.contact = {
    firstName: thread.contact?.firstName ?? "",
    lastName: thread.contact?.lastName ?? "",
    email: thread.contact?.email ?? "",
    phone: thread.contact?.phone ?? "",
    leadId,
  };
  thread.status = "handed_off";
  await saveThreads(threads);
  return thread;
}
