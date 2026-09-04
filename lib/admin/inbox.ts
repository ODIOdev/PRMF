import { LEAD_STAGE_META, isLeadStage } from "@/lib/admin/lead-pipeline";
import type { ChatIntent, ChatThread } from "@/lib/support-inbox";

export const INBOX_CHANNELS = ["chat", "contact", "appointment", "service", "sales", "finance", "trade"] as const;
export type InboxChannel = (typeof INBOX_CHANNELS)[number];

export type InboxLead = {
  id: string;
  type: string | null;
  stage: string;
  source: string | null;
  message: string | null;
  created_at: string;
  customers:
    | { first_name: string | null; last_name: string | null; email: string | null; phone: string | null }
    | { first_name: string | null; last_name: string | null; email: string | null; phone: string | null }[]
    | null;
};

export type InboxActivity = {
  id: string;
  lead_id: string | null;
  type: string;
  body: string;
  created_at: string;
};

export type InboxItem = {
  id: string;
  kind: "chat" | "lead";
  channel: InboxChannel;
  name: string;
  email: string | null;
  phone: string | null;
  preview: string;
  createdAt: string;
  unread: boolean;
  stageLabel: string | null;
  thread: ChatThread | null;
  leadId: string | null;
  message: string | null;
};

const CHANNEL_TAG = /^\s*\[([a-z]+)\]\s*/i;

export function isInboxChannel(value: string | undefined): value is InboxChannel {
  return Boolean(value && (INBOX_CHANNELS as readonly string[]).includes(value));
}

export function inboxHref(params: { channel?: string; id?: string }) {
  const search = new URLSearchParams();
  if (isInboxChannel(params.channel)) search.set("channel", params.channel);
  if (params.id) search.set("id", params.id);
  const qs = search.toString();
  return qs ? `/admin/inbox?${qs}` : "/admin/inbox";
}

export function stripChannelTag(message: string | null | undefined) {
  if (!message) return "";
  return message.replace(CHANNEL_TAG, "").trim();
}

export function leadCustomer(lead: InboxLead) {
  return Array.isArray(lead.customers) ? lead.customers[0] : lead.customers;
}

export function leadDisplayName(lead: InboxLead) {
  const customer = leadCustomer(lead);
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ");
  return name || customer?.email || customer?.phone || "Web lead";
}

export function classifyLead(lead: InboxLead): InboxChannel {
  const tagged = lead.message?.match(CHANNEL_TAG)?.[1]?.toLowerCase();
  if (tagged === "chat") return "chat";
  if (tagged === "schedule" || tagged === "appointment") return "appointment";
  if (tagged === "contact") return "contact";
  if (tagged === "sales" || tagged === "service" || tagged === "finance" || tagged === "trade") return tagged;
  const message = lead.message ?? "";
  if (message.startsWith("Visit:") || message.startsWith("Service:")) return "appointment";
  if (lead.type === "service") return "service";
  if (lead.type === "finance") return "finance";
  if (lead.type === "trade") return "trade";
  if (lead.source === "service") return "service";
  return "contact";
}

export const INBOX_CHANNEL_META: Record<InboxChannel, { label: string; hint: string; tone: string }> = {
  chat: { label: "Chat", hint: "Premier Assist", tone: "bg-ford text-white" },
  contact: { label: "Contact", hint: "Web form", tone: "bg-[#dbe7f5] text-ford" },
  appointment: { label: "Appointments", hint: "Schedule requests", tone: "bg-[#f7edd4] text-[#8a6a22]" },
  service: { label: "Service", hint: "Shop requests", tone: "bg-[#d7eef8] text-[#0f5f8a]" },
  sales: { label: "Sales", hint: "Inventory inquiries", tone: "bg-ford text-white" },
  finance: { label: "Finance", hint: "Credit apps", tone: "bg-[#eceff2] text-[#5b6570]" },
  trade: { label: "Trade", hint: "Appraisals", tone: "bg-lincoln-gold text-lincoln" },
};

function intentChannel(intent: ChatIntent): InboxChannel {
  if (intent === "appointment") return "appointment";
  if (intent === "service") return "service";
  if (intent === "sales") return "sales";
  return "chat";
}

function chatName(thread: ChatThread) {
  const contact = thread.contact;
  const name = [contact?.firstName, contact?.lastName].filter(Boolean).join(" ");
  return name || contact?.email || contact?.phone || "Website visitor";
}

export function buildInboxDesk({
  leads,
  threads,
  activities,
  channel,
  selectedId,
}: {
  leads: InboxLead[];
  threads: ChatThread[];
  activities: InboxActivity[];
  channel?: string;
  selectedId?: string;
}): {
  items: InboxItem[];
  selected: InboxItem | null;
  counts: Record<InboxChannel, number>;
  unread: number;
  total: number;
  activeChannel: InboxChannel | "all";
  notes: InboxActivity[];
} {
  const leadIdsFromChat = new Set(threads.map((row) => row.contact?.leadId).filter(Boolean));
  const chatItems: InboxItem[] = threads
    .filter((thread) => thread.messages.some((row) => row.role === "visitor"))
    .map((thread) => ({
      id: `chat:${thread.id}`,
      kind: "chat" as const,
      channel: thread.intent === "general" ? "chat" : intentChannel(thread.intent),
      name: chatName(thread),
      email: thread.contact?.email || null,
      phone: thread.contact?.phone || null,
      preview: thread.preview,
      createdAt: thread.updatedAt,
      unread: thread.unread,
      stageLabel: thread.contact ? "Handed off" : thread.status === "waiting" ? "Waiting" : "Live",
      thread,
      leadId: thread.contact?.leadId ?? null,
      message: null,
    }));

  const leadItems: InboxItem[] = leads
    .filter((lead) => !leadIdsFromChat.has(lead.id))
    .map((lead) => {
      const customer = leadCustomer(lead);
      const channelId = classifyLead(lead);
      const stage = isLeadStage(lead.stage) ? LEAD_STAGE_META[lead.stage].label : null;
      return {
        id: `lead:${lead.id}`,
        kind: "lead" as const,
        channel: channelId,
        name: leadDisplayName(lead),
        email: customer?.email ?? null,
        phone: customer?.phone ?? null,
        preview: stripChannelTag(lead.message) || `${channelId} inquiry`,
        createdAt: lead.created_at,
        unread: lead.stage === "new",
        stageLabel: stage,
        thread: null,
        leadId: lead.id,
        message: stripChannelTag(lead.message),
      };
    });

  const items = [...chatItems, ...leadItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const activeChannel = isInboxChannel(channel) ? channel : "all";
  const visible = activeChannel === "all" ? items : items.filter((item) => item.channel === activeChannel);
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0] ?? null;
  const counts = Object.fromEntries(INBOX_CHANNELS.map((id) => [id, items.filter((item) => item.channel === id).length])) as Record<
    InboxChannel,
    number
  >;
  const notes = selected?.leadId ? activities.filter((row) => row.lead_id === selected.leadId) : [];

  return {
    items: visible,
    selected,
    counts,
    unread: items.filter((item) => item.unread).length,
    total: items.length,
    activeChannel,
    notes,
  };
}
