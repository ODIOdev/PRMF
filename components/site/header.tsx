import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";
import { BrandLockup } from "@/components/site/logo";
import { MegaNav } from "@/components/site/mega-nav";
import { ScheduleDialog } from "@/components/site/schedule-dialog";
import { HeaderSearch } from "@/components/site/header-search";
import { getShopModels } from "@/lib/inventory";
import { navWithModels } from "@/lib/nav";
import { getDictionary } from "@/lib/get-dictionary";
import { getSiteSocials } from "@/lib/admin/settings";

export async function SiteHeader() {
  const [models, { t }, socials] = await Promise.all([getShopModels("ford"), getDictionary(), getSiteSocials()]);
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
            {t.sales} {dealership.phones.sales}
          </a>
        </div>
      </div>

      <div className="relative z-[60] border-b border-chrome">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <BrandLockup />
          <HeaderSearch />
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/inventory"
              className="inline-flex h-8 items-center bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-[#002654] md:hidden"
            >
              {t.search}
            </Link>
            <ScheduleDialog socials={socials} />
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
