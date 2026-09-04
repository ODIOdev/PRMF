import { dealership } from "@/lib/dealership";
import { LeadForm } from "@/components/site/lead-form";
import { getDictionary } from "@/lib/get-dictionary";

export default async function ServicePage() {
  const { t } = await getDictionary();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">{t.servicePage.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.servicePage.title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {t.servicePage.intro(dealership.serviceCenter.address)}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="border border-chrome bg-white p-6">
          <h2 className="font-semibold">{t.servicePage.ford}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{dealership.phones.fordService}</p>
        </div>
        <div className="border border-chrome bg-white p-6">
          <h2 className="font-semibold">{t.servicePage.lincoln}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{dealership.phones.lincolnService}</p>
        </div>
      </div>
      <div className="mt-10 max-w-xl">
        <LeadForm type="service" />
      </div>
    </div>
  );
}
