import { createDeskClient } from "@/lib/admin/session";
import { LeadPipelineBoard } from "@/components/admin/lead-pipeline-board";
import type { PipelineLead } from "@/lib/admin/lead-pipeline";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const supabase = await createDeskClient();
  const { data } = await supabase
    .from("leads")
    .select("id, stage, type, brand, source, created_at, customers(first_name, last_name, email, phone)")
    .order("created_at", { ascending: false });

  return <LeadPipelineBoard leads={(data ?? []) as PipelineLead[]} activeStage={stage} />;
}
