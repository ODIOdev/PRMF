import { createDeskClient } from "@/lib/admin/session";
import { InboxDesk } from "@/components/admin/inbox-desk";
import { buildInboxDesk, type InboxActivity, type InboxLead } from "@/lib/admin/inbox";
import { listChatThreads } from "@/lib/support-inbox";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; id?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createDeskClient();
  const [{ data: leads }, { data: activities }, threads] = await Promise.all([
    supabase
      .from("leads")
      .select("id, type, stage, source, message, created_at, customers(first_name, last_name, email, phone)")
      .order("created_at", { ascending: false })
      .limit(120),
    supabase.from("activities").select("id, lead_id, type, body, created_at").order("created_at", { ascending: false }).limit(200),
    listChatThreads(),
  ]);

  const desk = buildInboxDesk({
    leads: (leads ?? []) as InboxLead[],
    threads,
    activities: (activities ?? []) as InboxActivity[],
    channel: params.channel,
    selectedId: params.id,
  });

  return (
    <InboxDesk
      items={desk.items}
      selected={desk.selected}
      counts={desk.counts}
      unread={desk.unread}
      total={desk.total}
      activeChannel={desk.activeChannel}
      notes={desk.notes}
    />
  );
}
