import { localeRedirect } from "@/lib/locale-redirect";

export function GET(request: Request) {
  return localeRedirect(request, "en");
}
