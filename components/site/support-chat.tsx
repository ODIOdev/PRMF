"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Car, Clock, MessageCircle, MessageSquare, Send, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

export function SupportChat() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [onDark, setOnDark] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const { messages, sendMessage, setMessages, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: { locale } }),
  });

  const busy = status === "submitted" || status === "streaming";
  const smsHref = `sms:+1${dealership.phones.sales.replace(/\D/g, "")}?body=${encodeURIComponent(t.chat.textUsBody)}`;
  const suggestions = [
    { label: t.chat.hours, prompt: t.chat.hoursPrompt, icon: Clock },
    { label: t.chat.f150, prompt: t.chat.f150Prompt, icon: Car },
    { label: t.chat.schedule, prompt: t.chat.schedulePrompt, icon: Wrench },
  ];

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

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

  function endChat() {
    if (busy) stop();
    setMessages([]);
    setInput("");
    scroller.current?.scrollTo({ top: 0 });
  }

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
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
                <a
                  href={smsHref}
                  aria-label={`${t.chat.textUs} ${dealership.phones.sales}`}
                  className="flex flex-col items-start gap-1.5 rounded-xl border border-chrome/80 bg-white px-2.5 py-2 text-left transition hover:border-ford hover:text-ford"
                >
                  <MessageSquare className="size-3.5 text-ford" />
                  <span className="text-[11px] font-medium leading-4">{t.chat.textUs}</span>
                </a>
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
