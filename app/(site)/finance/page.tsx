import { dealership } from "@/lib/dealership";
import { LeadForm } from "@/components/site/lead-form";

export default function FinancePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-semibold">Finance and leasing</h1>
        <p className="mt-4 text-muted-foreground">
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
