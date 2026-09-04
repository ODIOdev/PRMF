import { LeadForm } from "@/components/site/lead-form";
import { getDictionary } from "@/lib/get-dictionary";

export default async function TradePage() {
  const { t } = await getDictionary();
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">{t.tradePage.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.tradePage.title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{t.tradePage.body}</p>
      </div>
      <LeadForm type="trade" />
    </div>
  );
}
