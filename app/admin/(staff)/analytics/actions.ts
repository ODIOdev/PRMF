"use server";

import { revalidatePath } from "next/cache";
import { createDeskClient, requireStaff } from "@/lib/admin/session";
import {
  AD_CAMPAIGNS_KEY,
  parseAdCampaignBoard,
  type AdCampaignBoard,
} from "@/lib/admin/ad-campaigns";

export async function saveAdCampaignBoard(board: AdCampaignBoard): Promise<{ ok: boolean; message: string }> {
  await requireStaff();
  const parsed = parseAdCampaignBoard(board);
  const supabase = await createDeskClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: AD_CAMPAIGNS_KEY,
    value: parsed,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/analytics");
  return { ok: true, message: "Ads board saved." };
}
