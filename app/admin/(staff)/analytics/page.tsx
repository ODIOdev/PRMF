import { createDeskClient } from "@/lib/admin/session";
import { parseAdCampaignBoard } from "@/lib/admin/ad-campaigns";
import { buildAnalyticsSnapshot } from "@/lib/admin/analytics";
import { AnalyticsDesk } from "@/components/admin/analytics-desk";
import { AdsCampaignBoard } from "@/components/admin/ads-board";
import type { AnalyticsLead } from "@/lib/admin/analytics";

export default async function AnalyticsPage() {
  const supabase = await createDeskClient();
  const [{ data: leads }, { data: ads }] = await Promise.all([
    supabase.from("leads").select("id, stage, type, brand, source, created_at"),
    supabase.from("site_settings").select("value").eq("key", "ad_campaigns").maybeSingle(),
  ]);
  const snapshot = buildAnalyticsSnapshot((leads ?? []) as AnalyticsLead[]);

  return (
    <div className="space-y-4">
      <AnalyticsDesk data={snapshot} />
      <AdsCampaignBoard board={parseAdCampaignBoard(ads?.value)} soldCount={snapshot.sold} />
    </div>
  );
}
