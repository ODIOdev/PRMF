import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CmsPage } from "@/components/site/cms-page";
import { getSitePage, sitePages } from "@/lib/site-pages";

export function generateStaticParams() {
  return sitePages.map((page) => ({ slug: page.slug.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getSitePage(slug.join("/"));
  if (!page) return { title: "Premier Brooklyn" };
  return { title: page.title, description: page.description || undefined };
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getSitePage(slug.join("/"));
  if (!page) notFound();
  return <CmsPage page={page} />;
}
