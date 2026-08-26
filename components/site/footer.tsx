import Link from "next/link";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-zinc-950 text-zinc-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Premier Brooklyn</p>
          <p className="mt-3 text-lg font-medium">Ford and Lincoln under one roof.</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Showroom</p>
          <p className="mt-2 text-sm text-zinc-400">
            {dealership.showroom.address}
            <br />
            {dealership.showroom.city}, {dealership.showroom.state} {dealership.showroom.zip}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Service</p>
          <p className="mt-2 text-sm text-zinc-400">
            {dealership.serviceCenter.address}
            <br />
            Ford {dealership.phones.fordService}
            <br />
            Lincoln {dealership.phones.lincolnService}
          </p>
        </div>
        <div className="text-sm">
          <a className="block hover:underline" href={formatPhoneHref(dealership.phones.sales)}>
            Sales {dealership.phones.sales}
          </a>
          <a className="mt-2 block hover:underline" href={`mailto:${dealership.email}`}>
            {dealership.email}
          </a>
          <Link href="/contact" className="mt-2 block hover:underline">
            Contact
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-zinc-500">
        Prices exclude tax, title, license and dealer fees. Vehicles subject to prior sale.
      </div>
    </footer>
  );
}
