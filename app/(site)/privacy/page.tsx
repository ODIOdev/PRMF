import type { Metadata } from "next";
import Link from "next/link";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";
import { LegalPage, LegalSection } from "@/components/site/legal-page";
import { getDictionary } from "@/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Premier Brooklyn, your authorized Ford and Lincoln dealer, collects and uses information on this website.",
};

export default async function PrivacyPage() {
  const { t } = await getDictionary();
  return (
    <LegalPage title={t.legal.privacyTitle} updated="August 26, 2026">
      <LegalSection title="Who we are">
        <p>
          This policy describes how {dealership.name} (“we,” “us”) handles information on this website. We are an
          independently owned and operated authorized Ford and Lincoln dealer. We are not Ford Motor Company or The
          Lincoln Motor Company. Manufacturer sites such as Ford.com and Lincoln.com have their own privacy practices.
        </p>
        <p>
          Showroom: {dealership.showroom.address}, {dealership.showroom.city}, {dealership.showroom.state}{" "}
          {dealership.showroom.zip}. Service and parts: {dealership.serviceCenter.address}, {dealership.serviceCenter.city},{" "}
          {dealership.serviceCenter.state} {dealership.serviceCenter.zip}.
        </p>
        <p>
          Questions:{" "}
          <a className="font-medium text-ford hover:underline" href={`mailto:${dealership.email}`}>
            {dealership.email}
          </a>{" "}
          or sales{" "}
          <a className="font-medium text-ford hover:underline" href={formatPhoneHref(dealership.phones.sales)}>
            {dealership.phones.sales}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>We collect information you choose to send us and information created when you use the site:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Name, email, phone, and message from sales, service, finance, trade, and contact forms</li>
          <li>Vehicle interest such as brand, model, VIN, stock number, and whether you asked about new, used, EV, or commercial inventory</li>
          <li>Whether you asked us to email you about a request</li>
          <li>Service and parts requests, including FordProtect and maintenance inquiries</li>
          <li>Search terms and filters you use on inventory pages</li>
          <li>Technical logs from hosting this site, such as IP address, browser type, and pages requested</li>
        </ul>
        <p>
          We do not currently run third-party advertising pixels on this site. Our hosting and database providers may
          process technical data as needed to keep the site online.
        </p>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use this information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Respond to Ford and Lincoln shopping, finance, trade-in, service, and parts requests</li>
          <li>Show inventory, pricing displayed on the site, and appointment options</li>
          <li>Follow up by phone or email when you ask us to</li>
          <li>Operate, secure, and improve this dealership website</li>
          <li>Meet legal, accounting, and record-keeping duties that apply to New York motor vehicle dealers</li>
        </ul>
      </LegalSection>

      <LegalSection title="How we share information">
        <p>
          We do not sell your personal information for money. We may share it only as needed to complete a request or
          run the dealership:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Premier Brooklyn sales, finance, service, and parts staff</li>
          <li>
            Ford Motor Company, The Lincoln Motor Company, FordDirect, and related OEM programs when needed to locate,
            order, price, or service a vehicle
          </li>
          <li>
            Lenders and finance sources, which may include Ford Credit or Lincoln financing partners, if you ask about
            financing or leasing. Submitting a website form is not by itself a credit decision
          </li>
          <li>Vendors that host this website and store lead records on our behalf</li>
          <li>Authorities when the law requires it, or to protect the dealership, our customers, or the public</li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies and account sessions">
        <p>
          This site uses cookies and similar storage that are needed for pages to work, including staff sign-in on the
          dealer dashboard. Inventory search filters may appear in the page address. We do not use those tools to sell
          ads on other websites.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You may request access, correction, or deletion of personal information we hold, or ask us to stop marketing
          email, by writing {dealership.email} or calling {dealership.phones.sales}. We may keep records required by law
          or needed to complete a sale, service visit, or finance file. If a manufacturer or lender holds a copy of your
          information, you may also need to contact them directly.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          This website is for adult vehicle shoppers and is not directed to children under 13. We do not knowingly
          collect personal information from children.
        </p>
      </LegalSection>

      <LegalSection title="Security and New York law">
        <p>
          We use reasonable administrative, technical, and physical safeguards appropriate to a dealership website,
          consistent with applicable law, including New York’s SHIELD Act. No website or database is completely secure.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy as the site or the law changes. The date at the top of this page is the current
          version. Continue using the site after an update means you accept the revised policy.
        </p>
        <p>
          Related:{" "}
          <Link href="/terms" className="font-medium text-ford hover:underline">
            Terms of Use
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
