"use client";

import { createContext, Suspense, useContext, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { messages, type Locale, type Messages } from "@/lib/i18n";

const LocaleContext = createContext<{ locale: Locale; t: Messages }>({
  locale: "en",
  t: messages.en,
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, t: messages[locale] }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleSwitch({ className }: { className?: string }) {
  const { locale } = useLocale();
  const label = locale === "es" ? "English" : "Español";
  return (
    <Suspense
      fallback={
        <Link href={locale === "es" ? "/english" : "/espanol"} className={className}>
          {label}
        </Link>
      }
    >
      <LocaleSwitchLink className={className} />
    </Suspense>
  );
}

function LocaleSwitchLink({ className }: { className?: string }) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const current = `${pathname}${search ? `?${search}` : ""}`;
  const next = pathname === "/espanol" || pathname === "/english" ? "/" : current;
  const href =
    locale === "es"
      ? `/english?next=${encodeURIComponent(next)}`
      : `/espanol?next=${encodeURIComponent(next)}`;
  return (
    <Link href={href} className={className} hrefLang={locale === "es" ? "en" : "es"}>
      {locale === "es" ? "English" : "Español"}
    </Link>
  );
}
