import Link from "next/link";
import type { ReactNode } from "react";
import { dealership } from "@/lib/dealership";
import { PremierLogo } from "@/components/site/logo";
import { SocialLinks } from "@/components/site/social-links";
import { LocaleSwitch } from "@/components/site/locale-provider";
import { compactHourDays, formatHourTime } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";

function mapsUrl(address: string, city: string, state: string, zip: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, ${state} ${zip}`)}`;
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{children}</p>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="block py-0.5 text-sm text-white/80 hover:text-white">
      {children}
    </Link>
  );
}

export async function SiteFooter() {
  const { locale, t } = await getDictionary();
  const year = new Date().getFullYear();
  const showroomMaps = mapsUrl(
    dealership.showroom.address,
    dealership.showroom.city,
    dealership.showroom.state,
    dealership.showroom.zip,
  );
  const serviceMaps = mapsUrl(
    dealership.serviceCenter.address,
    dealership.serviceCenter.city,
    dealership.serviceCenter.state,
    dealership.serviceCenter.zip,
  );
  const shopLinks = [
    { label: t.footer.newFord, href: "/inventory?brand=ford&condition=new" },
    { label: t.footer.usedInv, href: "/inventory?condition=used" },
    { label: t.footer.shopLincoln, href: "/lincoln" },
    { label: t.footer.fordEvs, href: "/inventory?brand=ford&ev=1" },
    { label: t.footer.commercial, href: "/commercial" },
    { label: t.footer.trade, href: "/trade" },
  ];
  const serviceLinks = [
    { label: t.footer.scheduleService, href: "/service/schedule" },
    { label: t.footer.serviceCenter, href: "/service" },
    { label: t.footer.parts, href: "/parts" },
    { label: t.footer.oil, href: "/service/oil" },
    { label: t.footer.tires, href: "/service/tires" },
    { label: t.footer.fordProtect, href: "/service/fordprotect" },
  ];
  const companyLinks = [
    { label: t.footer.about, href: "/about" },
    { label: t.footer.contact, href: "/contact" },
    { label: t.footer.directions, href: "/about/directions" },
    { label: t.footer.employment, href: "/about/employment" },
    { label: t.footer.finance, href: "/finance" },
    { label: t.footer.apply, href: "/finance/apply" },
  ];

  return (
    <footer data-chat-contrast="dark" className="mt-auto bg-ford text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" aria-label="Premier Brooklyn home">
              <PremierLogo height={56} />
            </Link>
          </div>
          <div className="flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/ford-oval.svg" alt="Ford" className="h-[28px] w-auto" />
            <span className="h-8 w-px bg-white/20" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/lincoln.svg" alt="Lincoln" className="h-[32px] w-auto brightness-0 invert" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <FooterHeading>{t.footer.showroom}</FooterHeading>
          <ul className="mt-4 space-y-1">
            {shopLinks.map((link) => (
              <li key={link.href + link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
          <SocialLinks variant="dark" className="mt-4" />
        </div>

        <div>
          <FooterHeading>{t.footer.serviceParts}</FooterHeading>
          <ul className="mt-4 space-y-1">
            {serviceLinks.map((link) => (
              <li key={link.href + link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterHeading>{t.footer.dealership}</FooterHeading>
          <ul className="mt-4 space-y-1">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
            <li>
              <LocaleSwitch className="block py-0.5 text-sm text-white/80 hover:text-white" />
            </li>
            <li>
              <FooterLink href="/admin">{t.footer.admin}</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <FooterHeading>{t.footer.hoursLocations}</FooterHeading>
          <div className="mt-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <a href={showroomMaps} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
                  {t.showroom}
                </span>
                <span className="mt-1.5 block leading-5">
                  {dealership.showroom.address}
                  <span className="block text-white/50">
                    {dealership.showroom.city}, {dealership.showroom.state} {dealership.showroom.zip}
                  </span>
                </span>
              </a>
              <a href={serviceMaps} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
                  {t.serviceParts}
                </span>
                <span className="mt-1.5 block leading-5">
                  {dealership.serviceCenter.address}
                  <span className="block text-white/50">
                    {dealership.serviceCenter.city}, {dealership.serviceCenter.state} {dealership.serviceCenter.zip}
                  </span>
                </span>
              </a>
            </div>
            <ul className="mt-4 space-y-1 border-t border-white/10 pt-4">
              {dealership.hours.map((row) => (
                <li key={row.days} className="flex justify-between gap-3 whitespace-nowrap leading-5">
                  <span className="text-white/45">{compactHourDays(row.days, locale)}</span>
                  <span className="tabular-nums text-white/80">{formatHourTime(row.time)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#002654]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs leading-5 text-white/45 md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{t.footer.rights(year)}</span>
            <Link href="/privacy" className="hover:text-white">
              {t.privacy}
            </Link>
            <Link href="/terms" className="hover:text-white">
              {t.terms}
            </Link>
          </p>
          <p>{t.footer.prices}</p>
        </div>
      </div>
    </footer>
  );
}
