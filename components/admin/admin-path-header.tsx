"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type RouteMeta = {
  match: RegExp;
  title: string;
  description?: string;
  back?: { href: string; label: string };
};

const ROUTES: RouteMeta[] = [
  { match: /^\/admin\/inventory\/new$/, title: "Add vehicle", back: { href: "/admin/inventory", label: "Back to inventory" } },
  { match: /^\/admin\/inventory\/[^/]+$/, title: "Vehicle", back: { href: "/admin/inventory", label: "Back to inventory" } },
  { match: /^\/admin\/inventory$/, title: "Inventory", description: "Live lot, aging, and rooftop mix" },
  { match: /^\/admin\/leads\/[^/]+$/, title: "Lead", back: { href: "/admin/leads", label: "Back to pipeline" } },
  { match: /^\/admin\/leads$/, title: "Pipeline", description: "Inquiry to sold — stage mix, conversion, and the deal board" },
  { match: /^\/admin\/customers$/, title: "People", description: "Admins, staff, and clients on the desk" },
  { match: /^\/admin\/inbox$/, title: "Inbox", description: "Chat, contact forms, and schedule requests — call, text, or email back" },
  { match: /^\/admin\/appointments$/, title: "Appointments", description: "Test drives, service, and delivery — today, this week, and the book" },
  { match: /^\/admin\/tasks$/, title: "Tasks", description: "Follow-ups for the desk" },
  { match: /^\/admin\/analytics$/, title: "Analytics", description: "Funnel, mix, and paid social campaigns" },
  { match: /^\/admin\/settings$/, title: "Settings", description: "Connectors, website socials, CSV backup, and desk reset" },
  { match: /^\/admin$/, title: "Overview", description: "Lot value, mix, pipeline, and the desk" },
];

export function AdminPathHeader() {
  const pathname = usePathname();
  const meta = ROUTES.find((route) => route.match.test(pathname));
  if (!meta) return null;
  return (
    <header className="border-b border-chrome bg-white px-4 py-4 md:px-6">
      {meta.back ? (
        <Link href={meta.back.href} className="mb-2 inline-flex items-center gap-0.5 text-[12px] font-medium text-ford hover:underline">
          <ChevronLeft className="size-3.5" />
          {meta.back.label}
        </Link>
      ) : null}
      <h1 className="text-xl font-semibold tracking-tight">{meta.title}</h1>
      {meta.description ? <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p> : null}
    </header>
  );
}
