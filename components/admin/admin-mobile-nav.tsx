"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { PremierLogo } from "@/components/site/logo";
import { AdminNavLinks } from "@/components/admin/admin-sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/app/admin/actions";

export function AdminMobileNav({ isGuest }: { isGuest: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between border-b border-chrome bg-ford px-4 py-3 text-white md:hidden">
      <PremierLogo height={32} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type="button" className="inline-flex size-9 items-center justify-center text-white" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="crm-desk flex h-full w-60 flex-col gap-0 bg-ford p-0 text-white" showCloseButton>
          <SheetTitle className="sr-only">Dealer CRM</SheetTitle>
          <div className="border-b border-white/10 px-5 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">Dealer CRM</p>
          </div>
          <AdminNavLinks isGuest={isGuest} onNavigate={() => setOpen(false)} />
          <div className="space-y-0.5 border-t border-white/10 p-3">
            <Link href="/" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-white/80">
              Back to website
            </Link>
            {isGuest ? (
              <Link href="/admin/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-white/80">
                Staff sign in
              </Link>
            ) : (
              <form action={signOut}>
                <button type="submit" className="px-3 py-2.5 text-sm text-white/80">
                  Sign out
                </button>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
