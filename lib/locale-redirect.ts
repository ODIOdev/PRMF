import { NextResponse } from "next/server";
import { LOCALE_COOKIE, safeNextPath, type Locale } from "@/lib/i18n";

export function localeRedirect(request: Request, locale: Locale) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, url.origin));
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
