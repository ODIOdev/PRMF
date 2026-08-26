import Link from "next/link";
import { getFeaturedVehicles, getInventoryCounts } from "@/lib/inventory";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";
import { VehicleCard } from "@/components/site/vehicle-card";
import { LeadForm } from "@/components/site/lead-form";

export default async function HomePage() {
  const [featured, counts] = await Promise.all([getFeaturedVehicles(6), getInventoryCounts()]);

  return (
    <div>
      <section className="grid min-h-[70vh] md:grid-cols-2">
        <Link href="/ford" className="group relative flex min-h-[46vh] flex-col justify-end bg-ford p-8 text-white md:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Premier Ford</p>
          <h1 className="mt-3 max-w-md text-4xl font-semibold tracking-tight md:text-6xl">Built for Brooklyn.</h1>
          <p className="mt-4 max-w-md text-white/80">
            F-150, Bronco, Explorer and commercial vans with clear pricing and {counts.ford} Ford vehicles ready to shop.
          </p>
          <span className="mt-8 inline-flex w-fit rounded-full bg-white px-5 py-2 text-sm font-medium text-ford group-hover:bg-white/90">
            Shop Ford
          </span>
        </Link>
        <Link href="/lincoln" className="group relative flex min-h-[46vh] flex-col justify-end bg-lincoln p-8 text-white md:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-lincoln-gold">Premier Lincoln</p>
          <h2 className="mt-3 max-w-md text-4xl font-semibold tracking-tight md:text-6xl">Quiet luxury.</h2>
          <p className="mt-4 max-w-md text-white/75">
            Navigator, Aviator, Nautilus and Corsair — {counts.lincoln} Lincoln vehicles from the same Glenwood Road rooftop.
          </p>
          <span className="mt-8 inline-flex w-fit rounded-full bg-lincoln-gold px-5 py-2 text-sm font-medium text-lincoln group-hover:bg-white">
            Shop Lincoln
          </span>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <form action="/inventory" className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-4">
          <select name="brand" className="h-11 rounded-lg border px-3" defaultValue="">
            <option value="">Any brand</option>
            <option value="ford">Ford</option>
            <option value="lincoln">Lincoln</option>
          </select>
          <select name="condition" className="h-11 rounded-lg border px-3" defaultValue="">
            <option value="">New and used</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
          <input name="q" placeholder="Model, stock or VIN" className="h-11 rounded-lg border px-3" />
          <button className="h-11 rounded-lg bg-primary text-primary-foreground">Search inventory</button>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Featured inventory</h2>
            <p className="text-muted-foreground">
              {counts.newCount} new and {counts.usedCount} used vehicles in stock or in transit.
            </p>
          </div>
          <Link href="/inventory" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="bg-zinc-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">One dealer. Two Blue Oval brands.</h2>
            <p className="mt-4 text-muted-foreground">{dealership.tagline}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>Sales: {dealership.showroom.address}</li>
              <li>Service: {dealership.serviceCenter.address}</li>
              <li>
                Call sales:{" "}
                <a className="font-medium text-primary" href={formatPhoneHref(dealership.phones.sales)}>
                  {dealership.phones.sales}
                </a>
              </li>
            </ul>
          </div>
          <LeadForm type="sales" />
        </div>
      </section>
    </div>
  );
}
