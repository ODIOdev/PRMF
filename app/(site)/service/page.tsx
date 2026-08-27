import { dealership } from "@/lib/dealership";
import { LeadForm } from "@/components/site/lead-form";

export default function ServicePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">Service</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Service and parts</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Factory-trained technicians for Ford and Lincoln at {dealership.serviceCenter.address}.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="border border-chrome bg-white p-6">
          <h2 className="font-semibold">Ford service</h2>
          <p className="mt-2 text-sm text-muted-foreground">{dealership.phones.fordService}</p>
        </div>
        <div className="border border-chrome bg-white p-6">
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
