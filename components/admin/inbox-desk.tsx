import Link from "next/link";
import type { ReactNode } from "react";
import { InboxContactBar } from "@/components/admin/inbox-contact-bar";
import { logInboxContact, replyInboxChat } from "@/app/admin/(staff)/inbox/actions";
import { AdminPanel } from "@/components/admin/admin-panel";
import { InboxLiveRefresh } from "@/components/admin/inbox-live-refresh";
import {
  INBOX_CHANNEL_META,
  INBOX_CHANNELS,
  inboxHref,
  type InboxActivity,
  type InboxChannel,
  type InboxItem,
} from "@/lib/admin/inbox";
import { formatPhoneHref } from "@/lib/format";
import { cn } from "@/lib/utils";

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function InboxDesk({
  items,
  selected,
  counts,
  unread,
  total,
  activeChannel,
  notes,
}: {
  items: InboxItem[];
  selected: InboxItem | null;
  counts: Record<InboxChannel, number>;
  unread: number;
  total: number;
  activeChannel: InboxChannel | "all";
  notes: InboxActivity[];
}) {
  return (
    <div className="space-y-3">
      <InboxLiveRefresh />
      <section className="grid grid-cols-2 gap-px overflow-hidden border border-chrome bg-chrome sm:grid-cols-3 lg:grid-cols-5" aria-label="Inbox totals">
        <Kpi href={inboxHref({})} label="All" value={String(total)} hint={`${unread} need a look`} active={activeChannel === "all"} />
        <Kpi href={inboxHref({ channel: "chat" })} label="Chat" value={String(counts.chat)} hint="Premier Assist" active={activeChannel === "chat"} />
        <Kpi href={inboxHref({ channel: "contact" })} label="Contact" value={String(counts.contact)} hint="Web forms" active={activeChannel === "contact"} />
        <Kpi
          href={inboxHref({ channel: "appointment" })}
          label="Appointments"
          value={String(counts.appointment)}
          hint="Schedule requests"
          active={activeChannel === "appointment"}
        />
        <Kpi href={inboxHref({ channel: "service" })} label="Service" value={String(counts.service)} hint="Shop requests" active={activeChannel === "service"} />
      </section>

      <AdminPanel>
        <div className="flex items-center gap-2 overflow-x-auto border-b border-chrome bg-[#f4f6f8] px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div role="group" aria-label="Inbox channel" className="inline-flex h-9 shrink-0 divide-x divide-chrome overflow-hidden border border-chrome bg-white">
            <ChannelSeg href={inboxHref({})} active={activeChannel === "all"}>
              All
            </ChannelSeg>
            {INBOX_CHANNELS.map((channel) => (
              <ChannelSeg key={channel} href={inboxHref({ channel })} active={activeChannel === channel}>
                {INBOX_CHANNEL_META[channel].label}
              </ChannelSeg>
            ))}
          </div>
        </div>

        <div className="grid min-h-[32rem] lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
          <ul className="divide-y divide-chrome/70 overflow-y-auto border-b border-chrome lg:border-r lg:border-b-0">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={inboxHref({ channel: activeChannel === "all" ? undefined : activeChannel, id: item.id })}
                  className={cn("block px-3 py-3 hover:bg-[#f7f8fa]", selected?.id === item.id && "bg-[#eef4fb]")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold tracking-tight">{item.name}</p>
                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{when(item.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={cn("px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", INBOX_CHANNEL_META[item.channel].tone)}>
                      {INBOX_CHANNEL_META[item.channel].label}
                    </span>
                    {item.unread ? (
                      <span className="bg-red-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">New</span>
                    ) : null}
                    {item.stageLabel ? <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.stageLabel}</span> : null}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.preview}</p>
                </Link>
              </li>
            ))}
            {items.length === 0 ? (
              <li className="px-4 py-16 text-center text-sm text-muted-foreground">
                Nothing in this channel yet. Website chat, contact forms, and schedule requests land here.
              </li>
            ) : null}
          </ul>

          <div className="min-w-0 bg-white">
            {selected ? <InboxDetail item={selected} notes={notes} /> : <EmptyDetail />}
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}

function InboxDetail({ item, notes }: { item: InboxItem; notes: InboxActivity[] }) {
  const meta = INBOX_CHANNEL_META[item.channel];
  const sms = item.phone ? `sms:+1${item.phone.replace(/\D/g, "")}` : null;
  const tel = item.phone ? formatPhoneHref(item.phone) : null;
  const mail = item.email
    ? `mailto:${item.email}?subject=${encodeURIComponent(`Premier Brooklyn — ${meta.label}`)}`
    : null;

  return (
    <div className="flex h-full min-h-[32rem] flex-col">
      <header className="border-b border-chrome px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{meta.hint}</p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight">{item.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.email || "No email"} · {item.phone || "No phone"}
            </p>
          </div>
          <span className={cn("px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", meta.tone)}>{meta.label}</span>
        </div>
        <InboxContactBar
          name={item.name}
          leadId={item.leadId}
          tel={tel}
          sms={sms}
          mail={mail}
        />
        {item.leadId ? (
          <div className="mt-1.5">
            <Link href={`/admin/leads/${item.leadId}`} className="inline-flex h-8 items-center border border-chrome px-2.5 text-[11px] font-semibold uppercase tracking-wide hover:border-ford hover:text-ford">
              Open deal
            </Link>
          </div>
        ) : null}
        {!item.email && !item.phone ? (
          <p className="mt-2 text-[11px] text-muted-foreground">Visitor has not left a number yet. Reply in chat or wait for the handoff form.</p>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {item.thread ? (
          <ol className="space-y-2">
            {item.thread.messages.map((row) => (
              <li key={row.id} className={cn("flex", row.role === "visitor" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] px-3 py-2 text-[13px] leading-5 whitespace-pre-wrap",
                    row.role === "visitor"
                      ? "bg-ford text-white"
                      : row.role === "staff"
                        ? "bg-lincoln-gold text-lincoln"
                        : "border border-chrome bg-[#f7f8fa]",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    {row.role === "visitor" ? "Customer" : row.role === "staff" ? "Desk" : "Assist"}
                  </p>
                  <p className="mt-0.5">{row.body}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : item.message ? (
          <p className="whitespace-pre-wrap text-sm leading-6">{item.message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No message on this inquiry.</p>
        )}

        {notes.length ? (
          <ul className="mt-4 space-y-2 border-t border-chrome pt-3">
            {notes.map((note) => (
              <li key={note.id}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {note.type} · {when(note.created_at)}
                </p>
                <p className="mt-0.5 text-sm">{note.body}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="border-t border-chrome bg-[#f7f8fa] px-4 py-3">
        {item.kind === "chat" && item.thread ? (
          <form action={replyInboxChat} className="space-y-2">
            <input type="hidden" name="threadId" value={item.thread.id} />
            <input type="hidden" name="visitorKey" value={item.thread.visitorKey} />
            {item.leadId ? <input type="hidden" name="leadId" value={item.leadId} /> : null}
            <label className="sr-only" htmlFor="inbox-reply">
              Reply in chat
            </label>
            <textarea
              id="inbox-reply"
              name="body"
              required
              rows={3}
              placeholder="Reply in Premier Assist…"
              className="w-full border border-input bg-white px-3 py-2 text-sm"
            />
            <button className="h-9 bg-ford px-3 text-sm font-medium text-white hover:bg-ford-bright">Send to visitor</button>
          </form>
        ) : item.leadId ? (
          <form action={logInboxContact} className="space-y-2">
            <input type="hidden" name="leadId" value={item.leadId} />
            <input type="hidden" name="type" value="note" />
            <label className="sr-only" htmlFor="inbox-note">
              Log a note
            </label>
            <textarea
              id="inbox-note"
              name="body"
              required
              rows={3}
              placeholder="Log a note after you call, text, or email…"
              className="w-full border border-input bg-white px-3 py-2 text-sm"
            />
            <button className="h-9 bg-ford px-3 text-sm font-medium text-white hover:bg-ford-bright">Save note</button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">Ask the visitor to leave a name and number in chat to open a deal.</p>
        )}
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="flex h-full min-h-[16rem] items-center justify-center px-6 text-center text-sm text-muted-foreground">
      Website chat, contact forms, and service/sales schedule requests appear here so the desk can call, text, or email back.
    </div>
  );
}

function ChannelSeg({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-full items-center px-2.5 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        active ? "bg-ford text-white" : "text-muted-foreground hover:bg-[#eef4fb] hover:text-ford",
      )}
    >
      {children}
    </Link>
  );
}

function Kpi({
  href,
  label,
  value,
  hint,
  active,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className={cn("bg-white px-3 py-2.5 hover:bg-[#f7f8fa]", active && "bg-[#eef4fb]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </Link>
  );
}
