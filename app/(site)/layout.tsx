import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { SupportChat } from "@/components/site/support-chat";
import { LocaleProvider } from "@/components/site/locale-provider";
import { getLocale } from "@/lib/get-dictionary";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <LocaleProvider locale={locale}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SupportChat />
    </LocaleProvider>
  );
}
