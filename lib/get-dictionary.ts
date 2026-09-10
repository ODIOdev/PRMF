import { cache } from "react";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, messages, type Locale } from "@/lib/i18n";

export const getLocale = cache(async (): Promise<Locale> => {
  const jar = await cookies();
  return jar.get(LOCALE_COOKIE)?.value === "es" ? "es" : "en";
});

export const getDictionary = cache(async () => {
  const locale = await getLocale();
  return { locale, t: messages[locale] };
});
