import type { Metadata } from "next";
import Link from "next/link";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";
import { LegalPage, LegalSection } from "@/components/site/legal-page";
import { getDictionary } from "@/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms for using the Premier Brooklyn website, an authorized Ford and Lincoln dealer in Brooklyn, NY.",
};

export default async function TermsPage() {
  const { t } = await getDictionary();
  return (
    <LegalPage title={t.legal.termsTitle} updated="August 26, 2026">
      <LegalSection title="The dealership and this site">
        <p>
          These terms govern your use of the Premier Brooklyn website. {dealership.name} is an independently owned
          authorized Ford and Lincoln dealer at {dealership.showroom.address}, {dealership.showroom.city},{" "}
          {dealership.showroom.state} {dealership.showroom.zip}. Service and parts are at {dealership.serviceCenter.address}.
        </p>
        <p>
          This site is our dealership site. It is not Ford.com, Lincoln.com, or an official Ford Motor Company or The
          Lincoln Motor Company website. We do not speak for those companies except as an authorized dealer selling and
          servicing their vehicles.
        </p>
      </LegalSection>

      <LegalSection title="Ford and Lincoln trademarks">
        <p>
          Ford, Lincoln, the Blue Oval, Built Ford Tough, FordPass, FordProtect, F-150, Mustang, Explorer, Bronco,
          Expedition, Escape, Maverick, Transit, Navigator, Aviator, Nautilus, Corsair, and related names, logos, and
          slogans are trademarks of Ford Motor Company, The Lincoln Motor Company, or their affiliates. They appear here
          because we are an authorized dealer. Those marks remain the manufacturer’s property. Nothing on this site
          grants you a license to use them.
        </p>
      </LegalSection>

      <LegalSection title="Using the website">
        <p>
          You may browse inventory, request information, and schedule service for lawful personal or business vehicle
          needs. Do not attempt to access staff-only areas, interfere with the site, or use automated tools in a way
          that disrupts service for other shoppers. We may suspend access if use is abusive or unlawful.
        </p>
      </LegalSection>

      <LegalSection title="Inventory, pricing, and photos">
        <p>
          Vehicles are subject to prior sale. Advertised internet prices, discounts, and payment examples are not an
          offer to sell at a particular price until a written buyer’s order is signed at the dealership. Prices exclude
          tax, title, license, registration, and dealer fees unless a page clearly says otherwise.
        </p>
        <p>
          Photos, equipment lists, and descriptions may come from the manufacturer, a vendor, or our lot. Options,
          mileage, and availability can change. Confirm the actual vehicle with a Premier Brooklyn advisor before you
          travel or send a deposit.
        </p>
        <p>
          Monthly payment figures on the site are display-only estimates, not a credit offer and not a quote from Ford
          Credit or any other lender.
        </p>
      </LegalSection>

      <LegalSection title="Finance, service, and leads">
        <p>
          Forms on this site send a request to Premier Brooklyn. They are not, by themselves, a credit application or a
          credit decision. If you apply for financing, lenders apply their own criteria. We may share your request with
          finance sources, including Ford Credit or Lincoln financing partners, only as needed to help with that
          request.
        </p>
        <p>
          Service scheduling, FordProtect, parts, and related pages describe dealer services. Manufacturer warranties
          and programs are provided by Ford or Lincoln under their own terms.
        </p>
      </LegalSection>

      <LegalSection title="Third-party sites">
        <p>
          Links to Ford, Lincoln, lenders, maps, or other sites are provided for convenience. Their terms and privacy
          policies control those sites. We are not responsible for content we do not operate.
        </p>
      </LegalSection>

      <LegalSection title="No warranty; limitation of liability">
        <p>
          The site is provided as a dealership information service, as available. We work to keep inventory and hours
          current, but we do not warrant that the site is error-free or uninterrupted. To the fullest extent allowed by
          New York law, Premier Brooklyn is not liable for indirect, incidental, or consequential damages arising from
          use of the site. Some consumer rights cannot be waived; this section does not limit those rights.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of the State of New York, without regard to conflict-of-law rules.
          Disputes relating to this website will be brought in the state or federal courts located in Kings County, New
          York, unless a motor vehicle or consumer statute requires another forum.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Email{" "}
          <a className="font-medium text-ford hover:underline" href={`mailto:${dealership.email}`}>
            {dealership.email}
          </a>
          . Call sales{" "}
          <a className="font-medium text-ford hover:underline" href={formatPhoneHref(dealership.phones.sales)}>
            {dealership.phones.sales}
          </a>
          .
        </p>
        <p>
          Related:{" "}
          <Link href="/privacy" className="font-medium text-ford hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
