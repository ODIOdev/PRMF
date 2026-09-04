import { ChevronRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { dealership } from "@/lib/dealership";
import { LeadForm } from "@/components/site/lead-form";
import { SocialLinks } from "@/components/site/social-links";
import { formatPhoneHref } from "@/lib/format";
import { getDictionary } from "@/lib/get-dictionary";
import { compactHourDays } from "@/lib/i18n";

function mapsUrl(address: string, city: string, state: string, zip: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, ${state} ${zip}`)}`;
}

export default async function ContactPage() {
  const { locale, t } = await getDictionary();
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
    <section className="border-t border-chrome bg-[#f4f6f8] py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative max-w-xl pl-5">
          <span
            aria-hidden
            className="absolute inset-y-0.5 left-0 w-[3px] rounded-full bg-linear-to-b from-ford to-lincoln-gold"
          />
          <p className="inline-flex items-center rounded-full border border-chrome bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
            {t.contactPage.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tight">{t.contactPage.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.contactPage.intro}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={showroomMaps}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-chrome bg-white p-5 transition hover:border-ford"
          >
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
              <MapPin className="size-3.5" />
              {t.showroom}
            </p>
            <p className="mt-3 text-base font-semibold tracking-tight">{dealership.showroom.address}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {dealership.showroom.city}, {dealership.showroom.state} {dealership.showroom.zip}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ford">
              {t.getDirections}
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
          <a
            href={serviceMaps}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-chrome bg-white p-5 transition hover:border-ford"
          >
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ford">
              <MapPin className="size-3.5" />
              {t.serviceParts}
            </p>
            <p className="mt-3 text-base font-semibold tracking-tight">{dealership.serviceCenter.address}</p>
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
              <p className="text-sm text-muted-foreground">
                {t.contactPage.parts} {dealership.phones.parts}
              </p>
              <a
                href={`mailto:${dealership.email}`}
                className="mt-3 flex items-center gap-2 text-sm font-medium text-ford hover:underline"
              >
                <Mail className="size-3.5" />
                {dealership.email}
              </a>
            </div>
            <SocialLinks className="md:self-end" />
          </div>
          <LeadForm type="sales" layout="landscape" className="p-5" />
        </div>
      </div>
    </section>
  );
}
