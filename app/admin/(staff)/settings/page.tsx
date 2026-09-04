import { createDeskClient } from "@/lib/admin/session";
import { getSiteSocials, parseConnectors } from "@/lib/admin/settings";
import {
  ApiConnectorsCard,
  CsvBackupCard,
  MasterResetCard,
  SocialsSettingsCard,
} from "@/components/admin/settings-cards";

export default async function SettingsPage() {
  const supabase = await createDeskClient();
  const [{ data }, socials] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "api_connectors").maybeSingle(),
    getSiteSocials(),
  ]);

  return (
    <div className="space-y-4">
      <ApiConnectorsCard connectors={parseConnectors(data?.value)} />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <SocialsSettingsCard socials={socials} />
        <CsvBackupCard />
      </div>
      <MasterResetCard />
    </div>
  );
}
