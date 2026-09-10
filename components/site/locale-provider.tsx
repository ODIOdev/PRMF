"use client";

import { createContext, Suspense, useContext, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOCALE_COOKIE, messages, type Locale, type Messages } from "@/lib/i18n";

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

function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function localeSwitchHref(locale: Locale, nextPath: string) {
  const next = encodeURIComponent(nextPath);
  return locale === "es" ? `/english?next=${next}` : `/espanol?next=${next}`;
}

export function LocaleSwitch({ className }: { className?: string }) {
  const { locale } = useLocale();
  const router = useRouter();
  const nextLocale = locale === "es" ? "en" : "es";
  const label = nextLocale === "es" ? "Español" : "English";

  function applyLocale(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    writeLocaleCookie(nextLocale);
    router.refresh();
  }

  return (
    <Suspense
      fallback={
        <Link
          href={localeSwitchHref(locale, "/")}
          className={className}
          hrefLang={nextLocale}
          prefetch={false}
          onClick={applyLocale}
        >
          {label}
        </Link>
      }
    >
      <LocaleSwitchLink className={className} onApply={applyLocale} />
    </Suspense>
  );
}

function LocaleSwitchLink({
  className,
  onApply,
}: {
  className?: string;
  onApply: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const current = `${pathname}${search ? `?${search}` : ""}`;
  const next = pathname === "/espanol" || pathname === "/english" ? "/" : current;
  const nextLocale = locale === "es" ? "en" : "es";
  return (
    <Link
      href={localeSwitchHref(locale, next)}
      className={className}
      hrefLang={nextLocale}
      prefetch={false}
      onClick={onApply}
    >
      {nextLocale === "es" ? "Español" : "English"}
    </Link>
  );
}
