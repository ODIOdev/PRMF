import { dealership } from "@/lib/dealership";
import { getScrapedPage } from "@/lib/site-pages";

export default function AboutPage() {
  const page = getScrapedPage("about");
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ford">Dealership</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{page.h1 || "About Premier Brooklyn"}</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
        {page.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-6 text-sm">
        Showroom: {dealership.showroom.address}, {dealership.showroom.city}, {dealership.showroom.state}{" "}
        {dealership.showroom.zip}
        <br />
        Service: {dealership.serviceCenter.address}
      </p>
    </div>
  );
}
