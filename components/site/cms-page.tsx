import Link from "next/link";
import { LeadForm } from "@/components/site/lead-form";
import { dealership } from "@/lib/dealership";
import type { getSitePage } from "@/lib/site-pages";
import { getDictionary } from "@/lib/get-dictionary";
import { cmsTitlesEs } from "@/lib/i18n";

export async function CmsPage({ page }: { page: NonNullable<ReturnType<typeof getSitePage>> }) {
  const { locale, t } = await getDictionary();
  const heading = locale === "es" ? (cmsTitlesEs[page.slug] ?? page.heading) : page.heading;
  return (
    <div>
      <section className="bg-ford text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/65">Premier Brooklyn</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">{heading}</h1>
          {locale === "en" && page.description ? (
            <p className="mt-3 max-w-2xl text-sm text-white/80">{page.description}</p>
          ) : null}
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.4fr_0.8fr]">
        <article className="space-y-5">
          {page.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={page.image} alt="" className="w-full border border-chrome object-cover" />
          ) : null}
          {locale === "es" ? (
            <p className="text-sm leading-7 text-foreground/90">{t.cms.esBody}</p>
          ) : (
            page.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-sm leading-7 text-foreground/90">
                {paragraph}
              </p>
            ))
          )}
          {locale === "en" && page.headings.length ? (
            <ul className="grid gap-2 border border-chrome bg-white p-5 text-sm">
              {page.headings.map((item) => (
                <li key={item} className="border-b border-chrome py-2 last:border-b-0">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {page.inventoryHref ? (
            <Link href={page.inventoryHref} className="inline-flex h-11 items-center bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-[#002654]">
              {t.cms.shopMatching}
            </Link>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {t.cms.salesLine(dealership.phones.sales, dealership.showroom.address, dealership.showroom.city)}
          </p>
        </article>
        <LeadForm type={page.leadType} />
      </div>
    </div>
  );
}
