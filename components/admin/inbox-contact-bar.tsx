"use client";

import { Mail, MessageSquare, Phone } from "lucide-react";
import { logInboxContact } from "@/app/admin/(staff)/inbox/actions";

export function InboxContactBar({
  name,
  leadId,
  tel,
  sms,
  mail,
}: {
  name: string;
  leadId: string | null;
  tel: string | null;
  sms: string | null;
  mail: string | null;
}) {
  function log(type: "call" | "sms" | "email", body: string) {
    if (!leadId) return;
    const data = new FormData();
    data.set("leadId", leadId);
    data.set("type", type);
    data.set("body", body);
    void logInboxContact(data);
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tel ? (
        <a
          href={tel}
          onClick={() => log("call", `Called ${name}`)}
          className="inline-flex h-8 items-center gap-1 border border-chrome bg-white px-2.5 text-[11px] font-semibold uppercase tracking-wide hover:border-ford hover:text-ford"
        >
          <Phone className="size-3" />
          Call
        </a>
      ) : null}
      {sms ? (
        <a
          href={sms}
          onClick={() => log("sms", `Texted ${name}`)}
          className="inline-flex h-8 items-center gap-1 border border-chrome bg-white px-2.5 text-[11px] font-semibold uppercase tracking-wide hover:border-ford hover:text-ford"
        >
          <MessageSquare className="size-3" />
          Text
        </a>
      ) : null}
      {mail ? (
        <a
          href={mail}
          onClick={() => log("email", `Emailed ${name}`)}
          className="inline-flex h-8 items-center gap-1 border border-chrome bg-white px-2.5 text-[11px] font-semibold uppercase tracking-wide hover:border-ford hover:text-ford"
        >
          <Mail className="size-3" />
          Email
        </a>
      ) : null}
    </div>
  );
}
