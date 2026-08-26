import { dealership } from "@/lib/dealership";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">About Premier Brooklyn</h1>
      <p className="mt-4 text-muted-foreground">
        Premier Ford and Premier Lincoln share one ownership group in Brooklyn. Shop both brands, service both brands, and
        keep department phone numbers consistent from this site.
      </p>
      <p className="mt-6 text-sm">
        Showroom: {dealership.showroom.address}, {dealership.showroom.city}, {dealership.showroom.state}{" "}
        {dealership.showroom.zip}
        <br />
        Service: {dealership.serviceCenter.address}
      </p>
    </div>
  );
}
