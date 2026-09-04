import Link from "next/link";
import { ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import { getFeaturedVehicles, getInventoryCounts } from "@/lib/inventory";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";
import { VehicleCard } from "@/components/site/vehicle-card";
import { LeadForm } from "@/components/site/lead-form";
import { PremierLogo } from "@/components/site/logo";
import { InventorySearch } from "@/components/site/inventory-search";
import { ShopByModel } from "@/components/site/shop-by-model";
import { SocialLinks } from "@/components/site/social-links";
import { getDictionary } from "@/lib/get-dictionary";
import { compactHourDays } from "@/lib/i18n";

const HERO_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAOABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDYeGziyHliXAycsKydZvI49i2MkD7+CxOdv6VBcXcZY4hX8hVOR4nJJi5PWs4X6mkkiP8As+Sdma4uMn/ZGR789qKRnUZAMmD1G80VoZn/2Q==";

export default async function HomePage() {
  const [featured, counts, { locale, t }] = await Promise.all([
    getFeaturedVehicles(6),
    getInventoryCounts(),
    getDictionary(),
  ]);

  return (
    <div>
      <section
        data-chat-contrast="dark"
        className="relative z-20 bg-ford bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${HERO_BLUR})` }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source
              type="image/avif"
              srcSet="/hero-sm.avif 800w, /hero.avif 1672w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/hero-sm.webp 800w, /hero.webp 1672w"
              sizes="100vw"
            />
            <img
              src="/hero.webp"
              alt={t.heroAlt}
              width={1672}
              height={941}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 size-full object-cover object-[68%_center]"
            />
          </picture>
          <div className="absolute inset-0 bg-linear-to-r from-ford/70 via-ford/30 to-ford/0" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[32rem] max-w-6xl flex-col justify-between px-4 pt-14 md:min-h-[40rem] md:pt-20">
          <div className="flex flex-1 items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                {t.authorizedDealer}
              </p>
              <h1 className="mt-4 w-[min(100%,16rem)] sm:w-[20rem] md:w-[22rem]">
                <span className="sr-only">Premier Brooklyn</span>
                <PremierLogo height={140} priority className="!h-auto !w-full" />
              </h1>
              <div className="mt-6 max-w-md border-l-2 border-lincoln-gold pl-4">
                <p className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                  {t.heroTagline}
                </p>
                <p className="mt-1.5 text-sm font-medium tracking-[0.12em] text-white/80 md:text-[15px]">
                  {t.heroSub}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/inventory?condition=new"
                  className="inline-flex h-10 items-center gap-1.5 bg-white px-5 text-sm font-semibold text-ford shadow-sm transition duration-200 ease-out hover:bg-ford-bright hover:text-white"
                >
                  {t.newInventory}
                  <ChevronRight className="size-4" />
                </Link>
                <Link
                  href="/inventory?condition=used"
                  className="inline-flex h-10 items-center gap-1.5 border border-white/70 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-[2px] transition duration-200 ease-out hover:border-white hover:bg-white hover:text-ford hover:shadow-[0_10px_24px_rgb(0_0_0_/_28%)]"
                >
                  {t.usedInventory}
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="py-6 md:py-8">
            <InventorySearch className="border-chrome shadow-[0_8px_24px_rgb(11_31_58_/_18%)]" />
          </div>
        </div>
      </section>

      <section className="border-b border-chrome bg-white">
        <div className="mx-auto grid max-w-6xl md:grid-cols-2">
          <Link
            href="/ford"
            className="group relative isolate flex min-h-[16.5rem] overflow-hidden md:min-h-[18rem]"
          >
            <img
              src="/cards/ford-lineup.webp"
              alt="Ford F-150, Explorer, and Transit"
              width={1350}
              height={900}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover object-[78%_center] transition duration-500 ease-out group-hover:scale-[1.02]"
            />
            <div className="relative z-10 my-5 ml-5 flex w-[min(calc(100%-1.5rem),20.5rem)] flex-col justify-center overflow-hidden rounded-2xl border-l-[3px] border-ford bg-white/45 px-5 py-5 shadow-[0_8px_32px_rgb(11_31_58_/_8%)] backdrop-blur-md backdrop-saturate-150 md:ml-6 md:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ford">Premier Ford</p>
              <h2 className="mt-2 text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[2rem]">
                {t.trucksSuvs}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                {t.fordInStock(counts.ford)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ford">
                {t.shopFord}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
          <Link
            href="/lincoln"
            className="group relative isolate flex min-h-[16.5rem] overflow-hidden md:min-h-[18rem]"
          >
            <img
              src="/cards/lincoln-lineup.webp"
              alt="Lincoln Navigator, Aviator, and Nautilus"
              width={1350}
              height={900}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover object-[22%_center] transition duration-500 ease-out group-hover:scale-[1.02]"
            />
            <div className="relative z-10 my-5 mr-5 ml-auto flex w-[min(calc(100%-1.5rem),20.5rem)] flex-col justify-center overflow-hidden rounded-2xl border-r-[3px] border-lincoln-gold bg-white/45 px-5 py-5 text-right shadow-[0_8px_32px_rgb(0_0_0_/_10%)] backdrop-blur-md backdrop-saturate-150 md:mr-6 md:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#3f2e1a]">
                Premier Lincoln
              </p>
              <h2 className="mt-2 text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-lincoln md:text-[2rem]">
                {t.lincolnLine}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                {t.lincolnInStock(counts.lincoln)}
              </p>
              <span className="mt-4 inline-flex items-center justify-end gap-1 text-sm font-semibold text-lincoln">
                {t.shopLincoln}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <ShopByModel />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t.featured}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.featuredSub}</p>
          </div>
          <Link href="/inventory" className="text-sm font-medium text-ford hover:underline">
            {t.viewAll}
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="border-t border-chrome bg-[#f4f6f8] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative max-w-xl pl-5">
            <span
              aria-hidden
              className="absolute inset-y-0.5 left-0 w-[3px] rounded-full bg-linear-to-b from-ford to-lincoln-gold"
            />
            <p className="inline-flex items-center rounded-full border border-chrome bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
              {t.visitUs}
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tight">
              {t.oneDealer}
              <span className="mt-1.5 block text-xl font-medium tracking-tight text-neutral-500 md:text-[1.35rem]">
                {t.twoBrands}
              </span>
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.tagline}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${dealership.showroom.address}, ${dealership.showroom.city}, ${dealership.showroom.state} ${dealership.showroom.zip}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-chrome bg-white p-5 transition hover:border-ford"
            >
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
                <MapPin className="size-3.5" />
                {t.showroom}
              </p>
              <p className="mt-3 text-base font-semibold tracking-tight">
                {dealership.showroom.address}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dealership.showroom.city}, {dealership.showroom.state} {dealership.showroom.zip}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ford">
                {t.getDirections}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${dealership.serviceCenter.address}, ${dealership.serviceCenter.city}, ${dealership.serviceCenter.state} ${dealership.serviceCenter.zip}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-chrome bg-white p-5 transition hover:border-ford"
            >
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
                <MapPin className="size-3.5" />
                {t.serviceParts}
              </p>
              <p className="mt-3 text-base font-semibold tracking-tight">
                {dealership.serviceCenter.address}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dealership.serviceCenter.city}, {dealership.serviceCenter.state} {dealership.serviceCenter.zip}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ford">
                {t.getDirections}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="flex flex-col gap-6 rounded-2xl border border-chrome bg-white p-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
                  <Clock className="size-3.5" />
                  {t.hours}
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  {dealership.hours.map((row) => (
                    <li key={row.days} className="flex flex-wrap gap-x-3">
                      <span className="min-w-[4.5rem] text-muted-foreground">{compactHourDays(row.days, locale)}</span>
                      <span className="font-medium tabular-nums">{row.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
                  <Phone className="size-3.5" />
                  {t.callSales}
                </p>
                <a
                  href={formatPhoneHref(dealership.phones.sales)}
                  className="mt-3 block text-xl font-semibold tracking-tight text-foreground hover:text-ford"
                >
                  {dealership.phones.sales}
                </a>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.fordService} {dealership.phones.fordService}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.lincolnService} {dealership.phones.lincolnService}
                </p>
              </div>
              <SocialLinks className="md:self-end" />
            </div>
            <LeadForm type="sales" layout="landscape" className="p-5" />
          </div>
        </div>
      </section>

      <section className="relative h-[min(70vh,40rem)] w-full overflow-hidden bg-muted" aria-label={t.map}>
        <h2 className="sr-only">{t.map}</h2>
        <iframe
          title={t.showroomMap(dealership.showroom.address, dealership.showroom.city)}
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            `${dealership.name}, ${dealership.showroom.address}, ${dealership.showroom.city}, ${dealership.showroom.state} ${dealership.showroom.zip}`,
          )}&z=16&hl=en&output=embed`}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>
    </div>
  );
}
