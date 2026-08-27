import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getFeaturedVehicles, getInventoryCounts } from "@/lib/inventory";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";
import { VehicleCard } from "@/components/site/vehicle-card";
import { LeadForm } from "@/components/site/lead-form";
import { PremierLogo } from "@/components/site/logo";
import { InventorySearch } from "@/components/site/inventory-search";
import { ShopByModel } from "@/components/site/shop-by-model";

const HERO_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAOABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDYeGziyHliXAycsKydZvI49i2MkD7+CxOdv6VBcXcZY4hX8hVOR4nJJi5PWs4X6mkkiP8As+Sdma4uMn/ZGR789qKRnUZAMmD1G80VoZn/2Q==";

export default async function HomePage() {
  const [featured, counts] = await Promise.all([getFeaturedVehicles(6), getInventoryCounts()]);

  return (
    <div>
      <section
        className="relative overflow-hidden bg-ford bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${HERO_BLUR})` }}
      >
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
            alt="Ford F-150 and Explorer on the Premier Brooklyn rooftop overlooking the Brooklyn Bridge"
            width={1672}
            height={941}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-[68%_center]"
          />
        </picture>
        <div className="absolute inset-0 bg-linear-to-r from-ford/70 via-ford/30 to-ford/0" />
        <div className="relative z-10 mx-auto flex min-h-[32rem] max-w-6xl flex-col justify-between px-4 pt-14 md:min-h-[40rem] md:pt-20">
          <div className="flex flex-1 items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                Authorized Ford and Lincoln dealer
              </p>
              <h1 className="mt-4 w-[min(100%,16rem)] sm:w-[20rem] md:w-[22rem]">
                <span className="sr-only">Premier Brooklyn</span>
                <PremierLogo height={140} priority className="!h-auto !w-full" />
              </h1>
              <p className="mt-6 max-w-lg text-lg font-medium leading-snug text-white md:text-xl">
                Built Ford Tough. Lincoln luxury. Brooklyn&apos;s dealer for both.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/inventory?condition=new"
                  className="inline-flex h-10 items-center gap-1.5 bg-white px-5 text-sm font-semibold text-ford shadow-sm transition duration-200 ease-out hover:bg-ford-bright hover:text-white"
                >
                  New inventory
                  <ChevronRight className="size-4" />
                </Link>
                <Link
                  href="/inventory?condition=used"
                  className="inline-flex h-10 items-center gap-1.5 border border-white/70 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-[2px] transition duration-200 ease-out hover:border-white hover:bg-white hover:text-ford hover:shadow-[0_10px_24px_rgb(0_0_0_/_28%)]"
                >
                  Used inventory
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
                Trucks, SUVs, and commercial.
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                {counts.ford} Ford vehicles in stock or in transit.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ford">
                Shop Ford
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a7b4f]">
                Premier Lincoln
              </p>
              <h2 className="mt-2 text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-lincoln md:text-[2rem]">
                Navigator, Aviator, Nautilus.
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                {counts.lincoln} Lincoln vehicles from the same rooftop.
              </p>
              <span className="mt-4 inline-flex items-center justify-end gap-1 text-sm font-semibold text-lincoln">
                Shop Lincoln
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
            <h2 className="text-2xl font-semibold tracking-tight">Featured inventory</h2>
            <p className="mt-1 text-sm text-muted-foreground">Current stock with advertised pricing.</p>
          </div>
          <Link href="/inventory" className="text-sm font-medium text-ford hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="border-t border-chrome bg-white py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">Visit us</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">One dealer. Two Blue Oval brands.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{dealership.tagline}</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>Sales: {dealership.showroom.address}</li>
              <li>Service: {dealership.serviceCenter.address}</li>
              <li>
                Call sales:{" "}
                <a className="font-medium text-ford hover:underline" href={formatPhoneHref(dealership.phones.sales)}>
                  {dealership.phones.sales}
                </a>
              </li>
            </ul>
          </div>
          <LeadForm type="sales" />
        </div>
      </section>
    </div>
  );
}
