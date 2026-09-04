import { dealership } from "@/lib/dealership";
import { getScrapedPage } from "@/lib/site-pages";
import { getDictionary } from "@/lib/get-dictionary";

export default async function AboutPage() {
  const page = getScrapedPage("about");
  const { locale, t } = await getDictionary();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">{t.about.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{locale === "es" ? t.about.title : page.h1 || t.about.title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
        {locale === "es" ? (
          <p>{t.cms.esBody}</p>
        ) : (
          page.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))
        )}
      </div>
      <p className="mt-6 text-sm">
        {t.about.showroom}: {dealership.showroom.address}, {dealership.showroom.city}, {dealership.showroom.state}{" "}
        {dealership.showroom.zip}
        <br />
        {t.about.service}: {dealership.serviceCenter.address}
      </p>
    </div>
  );
}
