import type { LeadType } from "@/lib/types";
import scraped from "@/data/premier-ford-pages.json";

type ScrapedPage = {
  source: string;
  title: string;
  h1: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  images: string[];
};

export type SitePage = {
  slug: string;
  scrapedKey: keyof typeof scraped;
  leadType: LeadType;
  inventoryHref?: string;
};

export const sitePages: SitePage[] = [
  { slug: "shop/custom-order", scrapedKey: "custom-order", leadType: "sales", inventoryHref: "/inventory?brand=ford&condition=new" },
  { slug: "shop/buy-online", scrapedKey: "buy-online", leadType: "sales", inventoryHref: "/inventory" },
  { slug: "shop/find-it-for-me", scrapedKey: "find-it-for-me", leadType: "sales" },
  { slug: "shop/research", scrapedKey: "research", leadType: "sales", inventoryHref: "/inventory?brand=ford" },
  { slug: "specials/new-ford", scrapedKey: "specials-new-ford", leadType: "sales", inventoryHref: "/inventory?brand=ford&condition=new" },
  { slug: "specials/service", scrapedKey: "specials-service", leadType: "service" },
  { slug: "specials/manufacturer", scrapedKey: "specials-manufacturer", leadType: "sales", inventoryHref: "/inventory?brand=ford" },
  { slug: "specials/regional", scrapedKey: "specials-regional", leadType: "sales" },
  { slug: "ev", scrapedKey: "ev", leadType: "sales", inventoryHref: "/inventory?brand=ford&ev=1" },
  { slug: "ev/f-150-lightning", scrapedKey: "ev-lightning", leadType: "sales", inventoryHref: "/inventory?q=Lightning" },
  { slug: "ev/mustang-mach-e", scrapedKey: "ev-mach-e", leadType: "sales", inventoryHref: "/inventory?q=Mach-E" },
  { slug: "ev/ownership", scrapedKey: "ev-ownership", leadType: "sales", inventoryHref: "/inventory?brand=ford&ev=1" },
  { slug: "ev/portal", scrapedKey: "ev-portal", leadType: "sales", inventoryHref: "/inventory?brand=ford&ev=1" },
  { slug: "ev/charging", scrapedKey: "ev-charging", leadType: "sales" },
  { slug: "commercial", scrapedKey: "commercial", leadType: "sales", inventoryHref: "/inventory?brand=ford&commercial=1" },
  { slug: "commercial/section-179", scrapedKey: "section-179", leadType: "finance" },
  { slug: "finance/apply", scrapedKey: "finance-apply", leadType: "finance" },
  { slug: "finance/buying-vs-leasing", scrapedKey: "buying-vs-leasing", leadType: "finance" },
  { slug: "finance/good-time-to-buy", scrapedKey: "good-time-to-buy", leadType: "finance" },
  { slug: "service/schedule", scrapedKey: "service-schedule", leadType: "service" },
  { slug: "service/mobile", scrapedKey: "service-mobile", leadType: "service" },
  { slug: "service/pickup-delivery", scrapedKey: "service-pickup", leadType: "service" },
  { slug: "service/battery-replacement", scrapedKey: "service-battery-replacement", leadType: "service" },
  { slug: "service/brakes", scrapedKey: "service-brakes", leadType: "service" },
  { slug: "service/oil", scrapedKey: "service-oil", leadType: "service" },
  { slug: "service/tires", scrapedKey: "service-tires", leadType: "service" },
  { slug: "service/tire-center", scrapedKey: "service-tire-center", leadType: "service" },
  { slug: "service/battery", scrapedKey: "service-battery", leadType: "service" },
  { slug: "service/maintenance", scrapedKey: "service-maintenance", leadType: "service" },
  { slug: "service/alignment", scrapedKey: "service-alignment", leadType: "service" },
  { slug: "service/fordprotect", scrapedKey: "fordprotect", leadType: "service" },
  { slug: "service/fordpass", scrapedKey: "fordpass", leadType: "service" },
  { slug: "parts", scrapedKey: "parts", leadType: "service" },
  { slug: "parts/brands", scrapedKey: "parts-brands", leadType: "service" },
  { slug: "parts/center", scrapedKey: "parts-center", leadType: "service" },
  { slug: "parts/accessories", scrapedKey: "accessories", leadType: "sales" },
  { slug: "about/directions", scrapedKey: "directions", leadType: "sales" },
  { slug: "about/employment", scrapedKey: "employment", leadType: "sales" },
  { slug: "about/ford-dealer", scrapedKey: "ford-dealer", leadType: "sales" },
  { slug: "about/staff", scrapedKey: "staff", leadType: "sales" },
  { slug: "about/referral-club", scrapedKey: "referral-club", leadType: "sales" },
  { slug: "about/renovation", scrapedKey: "renovation", leadType: "sales" },
  { slug: "about/blog", scrapedKey: "blog", leadType: "sales" },
  { slug: "about/reviews", scrapedKey: "reviews", leadType: "sales" },
  { slug: "about/write-a-review", scrapedKey: "write-a-review", leadType: "sales" },
  { slug: "espanol", scrapedKey: "espanol", leadType: "sales" },
];

const LOGO_BITS = ["98497be6e88ce324eaf7778a1b6658a4", "169f44c6d5ac4cec9a834d282ed20cc4"];

function cleanTitle(value: string, fallback: string) {
  if (!value || /^[A-Z0-9_]+$/.test(value) || value.length < 3) return fallback;
  return value.replace(/\s+\|\s+Premier Ford.*$/i, "").trim();
}

export function getSitePage(slug: string) {
  const config = sitePages.find((page) => page.slug === slug);
  if (!config) return null;
  const data = scraped[config.scrapedKey] as ScrapedPage;
  const heading =
    cleanTitle(data.h1, "") ||
    cleanTitle(data.title, "") ||
    slug.split("/").pop()?.replace(/-/g, " ") ||
    "Premier Brooklyn";
  const image =
    data.images
      .map((src) => src.replace(/&amp;/g, "&"))
      .find((src) => !LOGO_BITS.some((bit) => src.includes(bit))) ?? null;
  const paragraphs =
    data.paragraphs.length > 0
      ? data.paragraphs
      : [data.description, `Premier Brooklyn can help with this request at the Glenwood Road showroom or the East 49th Street service center.`].filter(
          Boolean,
        );
  const headings = data.headings.filter((h) => h.length > 2 && h !== "WHAT" && !/^[A-Z0-9_]+$/.test(h));
  return {
    ...config,
    title: cleanTitle(data.title, heading),
    heading,
    description: data.description,
    headings,
    paragraphs,
    image,
    source: data.source,
  };
}

export function getScrapedPage(key: keyof typeof scraped) {
  return scraped[key] as ScrapedPage;
}
