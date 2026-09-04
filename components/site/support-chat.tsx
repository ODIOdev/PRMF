"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Car, Clock, MessageCircle, MessageSquare, Send, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";
import { dealership } from "@/lib/dealership";

function messageText(parts: { type: string; text?: string }[]) {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("");
}

type DeskLine = { id: string; body: string; at: string };

export function SupportChat() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [onDark, setOnDark] = useState(false);
  const [handoff, setHandoff] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [handedOff, setHandedOff] = useState(false);
  const [deskLines, setDeskLines] = useState<DeskLine[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const visitorRef = useRef("");
  const threadRef = useRef<string | undefined>(undefined);
  const localeRef = useRef(locale);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  function ensureVisitor() {
    if (visitorRef.current) return visitorRef.current;
    let key = localStorage.getItem("prmf_assist_id");
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem("prmf_assist_id", key);
    }
    visitorRef.current = key;
    if (!threadRef.current) threadRef.current = sessionStorage.getItem("prmf_assist_thread") || undefined;
    return key;
  }

  /* Custom transport reads refs only inside fetch (on send), not during render. */
  /* eslint-disable react-hooks/refs */
  const { messages, sendMessage, setMessages, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (inputUrl, init) => {
        const visitorKey = ensureVisitor();
        const raw = typeof init?.body === "string" ? init.body : "{}";
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const res = await fetch(inputUrl, {
          ...init,
          body: JSON.stringify({
            ...parsed,
            locale: localeRef.current,
            visitorKey,
            threadId: threadRef.current,
          }),
        });
        const id = res.headers.get("x-thread-id");
        if (id) {
          threadRef.current = id;
          sessionStorage.setItem("prmf_assist_thread", id);
        }
        return res;
      },
    }),
  });
  /* eslint-enable react-hooks/refs */

  const busy = status === "submitted" || status === "streaming";
  const smsHref = `sms:+1${dealership.phones.sales.replace(/\D/g, "")}?body=${encodeURIComponent(t.chat.textUsBody)}`;
  const suggestions = [
    { label: t.chat.hours, prompt: t.chat.hoursPrompt, icon: Clock },
    { label: t.chat.f150, prompt: t.chat.f150Prompt, icon: Car },
    { label: t.chat.schedule, prompt: t.chat.schedulePrompt, icon: Wrench },
    { label: t.chat.desk, prompt: t.chat.deskPrompt, icon: MessageSquare },
  ];
  const userTurns = messages.filter((row) => row.role === "user").length;
  const showHandoff = open && !handedOff && userTurns > 0;

  useEffect(() => {
    let key = localStorage.getItem("prmf_assist_id");
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem("prmf_assist_id", key);
    }
    visitorRef.current = key;
    threadRef.current = sessionStorage.getItem("prmf_assist_thread") || undefined;
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, deskLines]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const launcher = launcherRef.current;
    if (!launcher) return;

    const update = () => {
      const rect = launcher.getBoundingClientRect();
      const x = Math.min(window.innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
      const y = Math.min(window.innerHeight - 1, Math.max(0, rect.top + rect.height / 2));
      const stack = document.elementsFromPoint(x, y);
      const behind = stack.find((el) => !launcher.contains(el) && !el.closest("[data-support-chat]"));
      setOnDark(Boolean(behind?.closest("[data-chat-contrast=dark]")));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function pull() {
      const visitor = ensureVisitor();
      const id = threadRef.current;
      if (!id || !visitor) return;
      const res = await fetch(`/api/chat/thread?id=${encodeURIComponent(id)}&visitor=${encodeURIComponent(visitor)}`);
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as {
        contact?: { leadId?: string | null } | null;
        messages?: { id: string; role: string; body: string; at: string }[];
      };
      if (data.contact?.leadId) setHandedOff(true);
      const staff = (data.messages ?? []).filter((row) => row.role === "staff");
      setDeskLines(staff.map((row) => ({ id: row.id, body: row.body, at: row.at })));
    }
    void pull();
    const timer = window.setInterval(() => void pull(), 6000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [open, messages.length]);

  function endChat() {
    if (busy) stop();
    setMessages([]);
    setInput("");
    setDeskLines([]);
    setHandedOff(false);
    threadRef.current = undefined;
    sessionStorage.removeItem("prmf_assist_thread");
    scroller.current?.scrollTo({ top: 0 });
  }

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
  }

  async function sendHandoff(event: FormEvent) {
    event.preventDefault();
    ensureVisitor();
    const threadId = threadRef.current;
    if (!threadId || !handoff.firstName.trim() || !handoff.phone.trim() || !handoff.email.trim()) return;
    const res = await fetch("/api/chat/handoff", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        threadId,
        visitorKey: visitorRef.current,
        firstName: handoff.firstName.trim(),
        lastName: handoff.lastName.trim(),
        email: handoff.email.trim(),
        phone: handoff.phone.trim(),
      }),
    });
    if (res.ok) setHandedOff(true);
  }

  return (
    <div data-support-chat className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      {open ? (
        <section
          aria-label="Premier Assist chat"
          className="flex h-[min(72vh,34rem)] w-[min(calc(100vw-2rem),24.5rem)] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_20px_60px_rgb(11_31_58_/_28%)]"
        >
          <header className="relative overflow-hidden bg-ford px-4 py-4 text-white">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-lincoln-gold/80" />
            <div className="flex items-center gap-3">
              <span className="relative flex size-11 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/20">
                <Bot className="size-5" />
                <span className="absolute right-0.5 bottom-0.5 size-2.5 rounded-full border-2 border-ford bg-emerald-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-tight tracking-tight">Premier Assist</p>
                <p className="mt-0.5 text-[11px] font-medium text-white/70">{t.chat.online}</p>
              </div>
              {messages.length > 0 ? (
                <button
                  type="button"
                  onClick={endChat}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {t.chat.endChat}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.chat.closeChat}
                className="flex size-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto bg-[#f4f6f8] px-3.5 py-4">
            <div className="flex gap-2">
              <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-ford text-white">
                <Bot className="size-3.5" />
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-chrome/70 bg-white px-3.5 py-2.5 text-[13px] leading-5 text-foreground shadow-[0_1px_2px_rgb(11_31_58_/_6%)]">
                {t.chat.hello}
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="grid grid-cols-2 gap-1.5 pl-9">
                {suggestions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => submit(item.prompt)}
                    className="flex flex-col items-start gap-1.5 rounded-xl border border-chrome/80 bg-white px-2.5 py-2 text-left transition hover:border-ford hover:text-ford"
                  >
                    <item.icon className="size-3.5 text-ford" />
                    <span className="text-[11px] font-medium leading-4">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((message) => {
              const text = messageText(message.parts);
              if (!text) return null;
              const user = message.role === "user";
              return (
                <div key={message.id} className={cn("flex gap-2", user && "justify-end")}>
                  {user ? null : (
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-ford text-white">
                      <Bot className="size-3.5" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-5",
                      user
                        ? "rounded-tr-sm bg-ford text-white"
                        : "rounded-tl-sm border border-chrome/70 bg-white text-foreground shadow-[0_1px_2px_rgb(11_31_58_/_6%)]",
                    )}
                  >
                    {text}
                  </div>
                </div>
              );
            })}

            {deskLines.map((line) => (
              <div key={line.id} className="flex gap-2">
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center bg-lincoln-gold text-[10px] font-bold text-lincoln">
                  {t.chat.deskReply.slice(0, 1)}
                </span>
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-lincoln-gold px-3.5 py-2.5 text-[13px] leading-5 text-lincoln">
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{t.chat.deskReply}</p>
                  {line.body}
                </div>
              </div>
            ))}

            {status === "submitted" ? (
              <div className="flex gap-2">
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-ford text-white">
                  <Bot className="size-3.5" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-chrome/70 bg-white px-3 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-ford/50 [animation-delay:-0.2s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-ford/50 [animation-delay:-0.1s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-ford/50" />
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
                {t.chat.error}
              </p>
            ) : null}

            {showHandoff ? (
              <form onSubmit={sendHandoff} className="ml-9 space-y-2 rounded-xl border border-chrome bg-white p-3">
                <p className="text-[12px] font-semibold tracking-tight">{t.chat.handoffTitle}</p>
                <p className="text-[11px] leading-4 text-muted-foreground">{t.chat.handoffHint}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    required
                    value={handoff.firstName}
                    onChange={(event) => setHandoff((row) => ({ ...row, firstName: event.target.value }))}
                    placeholder={t.firstName}
                    className="h-8 border border-input px-2 text-[12px]"
                  />
                  <input
                    value={handoff.lastName}
                    onChange={(event) => setHandoff((row) => ({ ...row, lastName: event.target.value }))}
                    placeholder={t.lastName}
                    className="h-8 border border-input px-2 text-[12px]"
                  />
                  <input
                    required
                    type="email"
                    value={handoff.email}
                    onChange={(event) => setHandoff((row) => ({ ...row, email: event.target.value }))}
                    placeholder={t.email}
                    className="h-8 border border-input px-2 text-[12px]"
                  />
                  <input
                    required
                    type="tel"
                    value={handoff.phone}
                    onChange={(event) => setHandoff((row) => ({ ...row, phone: event.target.value }))}
                    placeholder={t.phone}
                    className="h-8 border border-input px-2 text-[12px]"
                  />
                </div>
                <button type="submit" className="h-8 w-full bg-ford text-[12px] font-medium text-white hover:bg-ford-bright">
                  {t.chat.sendToDesk}
                </button>
              </form>
            ) : null}

            {handedOff ? (
              <p className="ml-9 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-900">{t.chat.sentToDesk}</p>
            ) : null}

            {messages.length > 0 ? (
              <div className="flex justify-center pl-9">
                <button
                  type="button"
                  onClick={endChat}
                  className="rounded-full border border-chrome/80 bg-white px-3 py-1.5 text-[11px] font-medium text-ford hover:border-ford"
                >
                  {t.chat.endChat}
                </button>
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-chrome bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit(input);
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-chrome bg-[#f7f8fa] py-1 pr-1 pl-3.5 focus-within:border-ford">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={busy}
                placeholder={t.chat.placeholder}
                className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  aria-label={t.chat.stop}
                  className="flex size-9 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-chrome hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label={t.chat.send}
                  className="flex size-9 items-center justify-center rounded-full bg-ford text-white transition hover:bg-ford-bright disabled:opacity-40"
                >
                  <Send className="size-3.5" />
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <a
                href={smsHref}
                aria-label={`${t.chat.textUs} ${dealership.phones.sales}`}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-ford hover:underline"
              >
                <MessageSquare className="size-3" />
                {t.chat.textUs}
              </a>
              <p className="text-[10px] text-muted-foreground">{t.chat.footer}</p>
            </div>
          </form>
        </section>
      ) : null}

      <Button
        ref={launcherRef}
        type="button"
        size="icon-lg"
        className={cn(
          "size-14 rounded-full shadow-[0_10px_28px_rgb(11_31_58_/_28%)]",
          onDark
            ? "bg-white text-ford hover:bg-white hover:text-ford"
            : "bg-ford text-white hover:bg-ford-bright hover:text-white",
        )}
        aria-expanded={open}
        aria-label={open ? t.chat.hide : t.chat.open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </div>
  );
}
