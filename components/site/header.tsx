import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";

const nav = [
  { href: "/inventory", label: "Shop" },
  { href: "/trade", label: "Sell or Trade" },
  { href: "/finance", label: "Finance" },
  { href: "/service", label: "Service" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="hidden border-b border-border bg-zinc-950 text-white md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs tracking-wide">
          <p className="flex items-center gap-2">
            <MapPin className="size-3.5" />
            {dealership.showroom.address}, {dealership.showroom.city}, {dealership.showroom.state}{" "}
            {dealership.showroom.zip}
          </p>
          <a className="flex items-center gap-2 hover:underline" href={formatPhoneHref(dealership.phones.sales)}>
            <Phone className="size-3.5" />
            Sales {dealership.phones.sales}
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="block text-[11px] uppercase text-muted-foreground">Premier Brooklyn</span>
          <span className="text-lg">Ford & Lincoln</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium md:gap-6">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/inventory"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground sm:inline-flex"
          >
            Search inventory
          </Link>
          <Link href="/service" className="rounded-full border px-4 py-2 text-sm">
            Schedule
          </Link>
        </div>
      </div>
    </header>
  );
}
