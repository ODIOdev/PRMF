import Link from "next/link";
import type { ReactNode } from "react";
import { Clock, MapPin } from "lucide-react";
import { dealership } from "@/lib/dealership";
import { PremierLogo } from "@/components/site/logo";

function mapsUrl(address: string, city: string, state: string, zip: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, ${state} ${zip}`)}`;
}

const shopLinks = [
  { label: "New Ford inventory", href: "/inventory?brand=ford&condition=new" },
  { label: "Used inventory", href: "/inventory?condition=used" },
  { label: "Shop Lincoln", href: "/lincoln" },
  { label: "Ford EVs", href: "/inventory?brand=ford&ev=1" },
  { label: "Commercial", href: "/commercial" },
  { label: "Value your trade", href: "/trade" },
];

const serviceLinks = [
  { label: "Schedule service", href: "/service/schedule" },
  { label: "Service center", href: "/service" },
  { label: "Parts", href: "/parts" },
  { label: "Oil change", href: "/service/oil" },
  { label: "Tires", href: "/service/tires" },
  { label: "FordProtect", href: "/service/fordprotect" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Directions", href: "/about/directions" },
  { label: "Employment", href: "/about/employment" },
  { label: "Finance", href: "/finance" },
  { label: "Apply for credit", href: "/finance/apply" },
];

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

export function SiteFooter() {
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

  return (
    <footer className="mt-auto bg-ford text-white">
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

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <FooterHeading>Shop</FooterHeading>
          <ul className="mt-4 space-y-1">
            {shopLinks.map((link) => (
              <li key={link.href + link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterHeading>Service &amp; parts</FooterHeading>
          <ul className="mt-4 space-y-1">
            {serviceLinks.map((link) => (
              <li key={link.href + link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterHeading>Dealership</FooterHeading>
          <ul className="mt-4 space-y-1">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
            <li>
              <FooterLink href="/espanol">Español</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <FooterHeading>Hours &amp; locations</FooterHeading>
          <a
            href={showroomMaps}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex gap-2 text-sm text-white/80 hover:text-white"
          >
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-white/55" />
            <span>
              <span className="block font-medium text-white">Showroom</span>
              {dealership.showroom.address}
              <br />
              {dealership.showroom.city}, {dealership.showroom.state} {dealership.showroom.zip}
            </span>
          </a>
          <a
            href={serviceMaps}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex gap-2 text-sm text-white/80 hover:text-white"
          >
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-white/55" />
            <span>
              <span className="block font-medium text-white">Service &amp; parts</span>
              {dealership.serviceCenter.address}
              <br />
              {dealership.serviceCenter.city}, {dealership.serviceCenter.state} {dealership.serviceCenter.zip}
            </span>
          </a>
          <div className="mt-4 flex gap-2 text-sm text-white/80">
            <Clock className="mt-0.5 size-3.5 shrink-0 text-white/55" />
            <ul className="space-y-0.5">
              {dealership.hours.map((row) => (
                <li key={row.days}>
                  <span className="text-white/55">{row.days}</span> {row.time}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#002654]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs leading-5 text-white/45 md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {year} Premier Brooklyn. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Use
            </Link>
          </p>
          <p>Prices exclude tax, title, license, and dealer fees. Vehicles subject to prior sale.</p>
        </div>
      </div>
    </footer>
  );
}
