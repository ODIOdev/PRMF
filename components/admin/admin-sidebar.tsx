"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { PremierLogo } from "@/components/site/logo";
import { ADMIN_NAV, isAdminNavActive } from "@/components/admin/admin-nav";
import { signOut } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export function AdminNavLinks({
  isGuest,
  onNavigate,
}: {
  isGuest: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Dealer CRM">
      {ADMIN_NAV.map(({ href, label, icon: Icon, guest }) => {
        const active = isAdminNavActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-lincoln-gold font-semibold text-lincoln"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
            {isGuest && !guest ? (
              <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-white/40">Staff</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ isGuest }: { isGuest: boolean }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col self-start bg-ford text-white md:flex">
      <div className="flex items-center justify-center border-b border-white/10 px-5 py-5">
        <Link href="/admin" className="flex flex-col items-center text-center">
          <PremierLogo height={56} />
          <p className="mt-2.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white">Dealer CRM</p>
        </Link>
      </div>
      <AdminNavLinks isGuest={isGuest} />
      <div className="space-y-0.5 border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
        >
          Back to website
        </Link>
        {isGuest ? (
          <Link
            href="/admin/login"
            className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
          >
            Staff sign in
          </Link>
        ) : (
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4 shrink-0" />
              Sign out
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
