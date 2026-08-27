import { dealership } from "@/lib/dealership";
import { LeadForm } from "@/components/site/lead-form";

export default function FinancePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">Finance</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Finance and leasing</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Premier Brooklyn works with lenders so Brooklyn buyers can finance or lease Ford and Lincoln vehicles with a
          straightforward path. This is not a credit decision — start with a request and an advisor will follow up.
        </p>
        <p className="mt-6 text-sm">
          Sales: {dealership.phones.sales}
          <br />
          {dealership.email}
        </p>
      </div>
      <LeadForm type="finance" />
    </div>
  );
}
