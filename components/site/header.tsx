import Link from "next/link";
import { Phone, MapPin, Search } from "lucide-react";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";
import { BrandLockup } from "@/components/site/logo";
import { MegaNav } from "@/components/site/mega-nav";
import { getShopModels } from "@/lib/inventory";
import { navWithModels } from "@/lib/nav";

export async function SiteHeader() {
  const models = await getShopModels("ford");
  const items = navWithModels(models);

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="hidden bg-ford text-white md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-[12px] tracking-wide">
          <p className="flex items-center gap-2 text-white/85">
            <MapPin className="size-3.5" />
            {dealership.showroom.address}, {dealership.showroom.city}, {dealership.showroom.state}{" "}
            {dealership.showroom.zip}
          </p>
          <a className="flex items-center gap-2 font-medium hover:text-white" href={formatPhoneHref(dealership.phones.sales)}>
            <Phone className="size-3.5" />
            Sales {dealership.phones.sales}
          </a>
        </div>
      </div>

      <div className="border-b border-chrome">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <BrandLockup />
          <form action="/inventory" className="hidden min-w-0 flex-1 md:block">
            <label htmlFor="header-inventory-search" className="sr-only">
              Search inventory
            </label>
            <div className="mx-auto flex h-8 max-w-xl items-center border border-chrome bg-[#f7f8fa] focus-within:border-ford">
              <Search className="ml-2.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="header-inventory-search"
                name="q"
                type="search"
                placeholder="Search inventory, model, or VIN"
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="h-full bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-[#002654]"
              >
                Search
              </button>
            </div>
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/inventory"
              className="inline-flex h-8 items-center bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-[#002654] md:hidden"
            >
              Search
            </Link>
            <Link
              href="/service/schedule"
              className="inline-flex h-8 items-center border border-chrome px-3 text-xs font-medium text-foreground hover:border-ford hover:text-ford"
            >
              Schedule
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-50 overflow-visible border-b border-chrome bg-[#f7f8fa]">
        <div className="mx-auto flex max-w-6xl items-center px-4">
          <MegaNav items={items} />
        </div>
      </div>
    </header>
  );
}
