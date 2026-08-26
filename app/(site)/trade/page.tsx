import { LeadForm } from "@/components/site/lead-form";

export default function TradePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-semibold">Sell or trade your vehicle</h1>
        <p className="mt-4 text-muted-foreground">
          Start with year, make, model and mileage. An advisor will confirm value and apply it toward a Ford or Lincoln.
        </p>
      </div>
      <LeadForm type="trade" />
    </div>
  );
}
