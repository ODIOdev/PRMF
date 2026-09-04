import { cookies } from "next/headers";
import { LOCALE_COOKIE, messages, type Locale } from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  return jar.get(LOCALE_COOKIE)?.value === "es" ? "es" : "en";
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: messages[locale] };
}
