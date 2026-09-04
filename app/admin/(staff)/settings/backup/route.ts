import { getAdminAccess, createDeskClient } from "@/lib/admin/session";
import { BACKUP_TABLES, isBackupTable, toCsv } from "@/lib/admin/csv-backup";

export async function GET(request: Request) {
  const { fullCrm } = await getAdminAccess();
  if (!fullCrm) return new Response("Unauthorized", { status: 401 });

  const table = new URL(request.url).searchParams.get("table");
  const wanted = BACKUP_TABLES.filter((name) => !table || table === "all" || table === name);
  if (!wanted.length || (table && table !== "all" && !isBackupTable(table))) {
    return new Response("Unknown table", { status: 400 });
  }

  const supabase = await createDeskClient();
  const chunks: string[] = [];
  for (const name of wanted) {
    const { data } = await supabase.from(name).select("*");
    const body = toCsv((data ?? []) as Record<string, unknown>[]);
    if (wanted.length === 1) {
      return new Response(body || `${name}\n`, {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="premier-${name}.csv"`,
        },
      });
    }
    chunks.push(`# table:${name}\n${body || "(empty)"}\n`);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(chunks.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="premier-crm-backup-${stamp}.csv"`,
    },
  });
}
