import { dealership } from "@/lib/dealership";
import { LeadForm } from "@/components/site/lead-form";
import { getDictionary } from "@/lib/get-dictionary";

export default async function FinancePage() {
  const { t } = await getDictionary();
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">{t.financePage.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.financePage.title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{t.financePage.body}</p>
        <p className="mt-6 text-sm">
          {t.sales}: {dealership.phones.sales}
          <br />
          {dealership.email}
        </p>
      </div>
      <LeadForm type="finance" />
    </div>
  );
}
