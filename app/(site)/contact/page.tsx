import { dealership } from "@/lib/dealership";
import { LeadForm } from "@/components/site/lead-form";
import { formatPhoneHref } from "@/lib/format";

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">Contact</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Contact</h1>
        <ul className="mt-6 space-y-2 text-sm">
          <li>
            Sales:{" "}
            <a className="font-medium text-ford hover:underline" href={formatPhoneHref(dealership.phones.sales)}>
              {dealership.phones.sales}
            </a>
          </li>
          <li>Parts: {dealership.phones.parts}</li>
          <li>
            Email:{" "}
            <a className="font-medium text-ford hover:underline" href={`mailto:${dealership.email}`}>
              {dealership.email}
            </a>
          </li>
        </ul>
        <ul className="mt-6 text-sm text-muted-foreground">
          {dealership.hours.map((row) => (
            <li key={row.days}>
              {row.days}: {row.time}
            </li>
          ))}
        </ul>
      </div>
      <LeadForm type="sales" />
    </div>
  );
}
