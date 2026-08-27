import { LeadForm } from "@/components/site/lead-form";

export default function TradePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">Trade-in</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sell or trade your vehicle</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Start with year, make, model and mileage. An advisor will confirm value and apply it toward a Ford or Lincoln.
        </p>
      </div>
      <LeadForm type="trade" />
    </div>
  );
}
