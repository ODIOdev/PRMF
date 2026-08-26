import { dealership } from "@/lib/dealership";
import { LeadForm } from "@/components/site/lead-form";

export default function ServicePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Service and parts</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Factory-trained technicians for Ford and Lincoln at {dealership.serviceCenter.address}.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Ford service</h2>
          <p className="mt-2 text-sm text-muted-foreground">{dealership.phones.fordService}</p>
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Lincoln service</h2>
          <p className="mt-2 text-sm text-muted-foreground">{dealership.phones.lincolnService}</p>
        </div>
      </div>
      <div className="mt-10 max-w-xl">
        <LeadForm type="service" />
      </div>
    </div>
  );
}
