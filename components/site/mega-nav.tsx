"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import type { NavItem } from "@/lib/nav";
import { translateNav } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LocaleSwitch, useLocale } from "@/components/site/locale-provider";

export function MegaNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const navItems = translateNav(items, locale);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpenId(null);
    setMobileOpen(false);
  }
  const desktopRef = useRef<HTMLDivElement>(null);
  const openItem = navItems.find((item) => item.id === openId && item.columns?.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenId(null);
        setMobileOpen(false);
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (!desktopRef.current?.contains(event.target as Node)) setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="relative hidden w-full lg:block" ref={desktopRef}>
        <nav className="flex w-full items-center" aria-label="Primary">
          {navItems.map((item) =>
            item.columns?.length ? (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "inline-flex h-12 flex-1 items-center justify-center gap-1.5 px-2 text-base font-medium hover:text-ford",
                  openId === item.id ? "text-ford" : "text-foreground/80",
                )}
                aria-expanded={openId === item.id}
                onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
              >
                {item.label}
                <ChevronDown className={cn("mega-chevron size-4", openId === item.id && "is-open")} />
              </button>
            ) : item.id === "espanol" ? (
              <LocaleSwitch
                key={item.id}
                className="inline-flex h-12 flex-1 items-center justify-center px-2 text-base font-medium text-foreground/80 hover:text-ford"
              />
            ) : (
              <Link
                key={item.id}
                href={item.href ?? "/"}
                className="inline-flex h-12 flex-1 items-center justify-center px-2 text-base font-medium text-foreground/80 hover:text-ford"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {openItem?.columns ? (
          <div className="mega-panel is-open">
            <div
              className={cn(
                "mx-auto grid max-w-6xl gap-8 px-4 py-6",
                openItem.columns.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4",
              )}
            >
              {openItem.columns.map((column) => (
                <div key={column.heading || column.links[0]?.href}>
                  {column.heading ? (
                    <p className="border-b border-chrome pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ford">
                      {column.heading}
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-1.5">
                    {column.links.map((link) => (
                      <li key={link.href + link.label}>
                        <Link href={link.href} className="block py-0.5 text-[13px] text-foreground/80 hover:text-ford" onClick={() => setOpenId(null)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {column.note ? (
                    <p className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">{column.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex h-10 items-center lg:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-[13px] font-medium"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          {t.menu}
        </button>
      </div>

      {mobileOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 max-h-[70vh] overflow-y-auto border-b border-chrome bg-white lg:hidden">
          <form action="/inventory" className="border-b border-chrome p-3">
            <label htmlFor="mobile-inventory-search" className="sr-only">
              {t.searchInventory}
            </label>
            <div className="flex h-10 items-center border border-chrome bg-[#f7f8fa] focus-within:border-ford">
              <Search className="ml-2.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="mobile-inventory-search"
                name="q"
                type="search"
                placeholder={t.searchPlaceholder}
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="h-full bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-[#002654]"
              >
                {t.search}
              </button>
            </div>
          </form>
          {navItems.map((item) => (
            <MobileSection key={item.id} item={item} onNavigate={() => setMobileOpen(false)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileSection({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  if (item.id === "espanol") {
    return (
      <LocaleSwitch className="block border-b border-chrome px-4 py-3 text-sm" />
    );
  }
  if (!item.columns?.length) {
    return (
      <Link href={item.href ?? "/"} className="block border-b border-chrome px-4 py-3 text-sm" onClick={onNavigate}>
        {item.label}
      </Link>
    );
  }
  return (
    <details className="border-b border-chrome">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium">{item.label}</summary>
      <div className="grid gap-4 bg-[#f7f8fa] px-4 pb-4">
        {item.columns.map((column) => (
          <div key={column.heading || column.links[0]?.href}>
            {column.heading ? (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ford">{column.heading}</p>
            ) : null}
            <ul className="space-y-1">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="block py-1 text-sm text-foreground/80" onClick={onNavigate}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {column.note ? <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">{column.note}</p> : null}
          </div>
        ))}
      </div>
    </details>
  );
}
