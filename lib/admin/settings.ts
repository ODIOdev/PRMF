import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { rememberSupabaseFailure, withSupabaseFallback } from "@/lib/supabase/availability";
import { dealership } from "@/lib/dealership";

export type SiteSocial = {
  id: string;
  name: string;
  href: string;
  sort_order: number;
};

export type ApiConnector = {
  id: string;
  name: string;
  kind: "inventory" | "webhook" | "maps" | "custom";
  endpoint: string;
  apiKey: string;
};

export const CONNECTOR_KINDS = ["inventory", "webhook", "maps", "custom"] as const;

export function parseConnectors(value: unknown): ApiConnector[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const kind = CONNECTOR_KINDS.includes(item.kind as (typeof CONNECTOR_KINDS)[number])
        ? (item.kind as ApiConnector["kind"])
        : "custom";
      return {
        id: String(item.id ?? crypto.randomUUID()),
        name: String(item.name ?? "Connector"),
        kind,
        endpoint: String(item.endpoint ?? ""),
        apiKey: String(item.apiKey ?? ""),
      };
    })
    .filter((row): row is ApiConnector => Boolean(row));
}

const defaultSocials: SiteSocial[] = dealership.socials.map((social, index) => ({
  id: `default-${index}`,
  name: social.name,
  href: social.href,
  sort_order: index,
}));

export const getSiteSocials = cache(async (): Promise<SiteSocial[]> => {
  return withSupabaseFallback(defaultSocials, async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_socials").select("id, name, href, sort_order").order("sort_order");
    if (error) {
      rememberSupabaseFailure(error);
      return defaultSocials;
    }
    return data?.length ? data : defaultSocials;
  });
});
