"use server";

import { revalidatePath } from "next/cache";
import { createDeskClient, requireStaff } from "@/lib/admin/session";
import { CONNECTOR_KINDS, parseConnectors, type ApiConnector } from "@/lib/admin/settings";
import { conflictKey, IMPORT_ORDER, parseBackupFile } from "@/lib/admin/csv-backup";

function revalidateSite() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/contact");
}

async function readConnectors(supabase: Awaited<ReturnType<typeof createDeskClient>>) {
  const { data } = await supabase.from("site_settings").select("value").eq("key", "api_connectors").maybeSingle();
  return parseConnectors(data?.value);
}

async function writeConnectors(
  supabase: Awaited<ReturnType<typeof createDeskClient>>,
  connectors: ApiConnector[],
) {
  await supabase.from("site_settings").upsert({
    key: "api_connectors",
    value: connectors,
    updated_at: new Date().toISOString(),
  });
}

export async function addSocial(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();
  if (!name || !href) return;
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
  } catch {
    return;
  }
  const supabase = await createDeskClient();
  const { data: last } = await supabase.from("site_socials").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  await supabase.from("site_socials").insert({
    name,
    href,
    sort_order: (last?.[0]?.sort_order ?? 0) + 1,
  });
  revalidateSite();
}

export async function deleteSocial(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createDeskClient();
  await supabase.from("site_socials").delete().eq("id", id);
  revalidateSite();
}

export async function addConnector(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "custom");
  const endpoint = String(formData.get("endpoint") ?? "").trim();
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  if (!name) return;
  const kind = CONNECTOR_KINDS.includes(kindRaw as (typeof CONNECTOR_KINDS)[number])
    ? (kindRaw as ApiConnector["kind"])
    : "custom";
  const supabase = await createDeskClient();
  const connectors = await readConnectors(supabase);
  connectors.push({
    id: crypto.randomUUID(),
    name,
    kind,
    endpoint,
    apiKey,
  });
  await writeConnectors(supabase, connectors);
  revalidatePath("/admin/settings");
}

export async function deleteConnector(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const supabase = await createDeskClient();
  const connectors = (await readConnectors(supabase)).filter((row) => row.id !== id);
  await writeConnectors(supabase, connectors);
  revalidatePath("/admin/settings");
}

export async function probeConnector(formData: FormData): Promise<{ ok: boolean; message: string; status: "ok" | "warn" | "down" }> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const supabase = await createDeskClient();
  const connector = (await readConnectors(supabase)).find((row) => row.id === id);
  if (!connector) return { ok: false, message: "Connector not found.", status: "down" };
  if (!connector.endpoint) return { ok: false, message: "No endpoint to probe.", status: "warn" };
  try {
    const headers: Record<string, string> = { "user-agent": "PremierCRM/1.0" };
    if (connector.apiKey) headers.authorization = `Bearer ${connector.apiKey}`;
    const response = await fetch(connector.endpoint, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers,
    });
    if (response.ok) return { ok: true, message: `Live · ${response.status}`, status: "ok" };
    return {
      ok: false,
      message: `Reached · ${response.status}`,
      status: response.status >= 500 ? "down" : "warn",
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Probe failed.", status: "down" };
  }
}

export async function importCsvBackup(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a CSV file." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, message: "CSV is over 8 MB." };
  const tableHint = String(formData.get("table") ?? "auto").trim();
  let sections;
  try {
    sections = parseBackupFile(await file.text(), tableHint);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not read that CSV." };
  }
  const byTable = new Map(sections.map((section) => [section.table, section.rows]));
  const supabase = await createDeskClient();
  const imported: string[] = [];
  for (const table of IMPORT_ORDER) {
    const rows = byTable.get(table);
    if (!rows?.length) continue;
    if (rows.length > 5_000) return { ok: false, message: `${table} has more than 5,000 rows.` };
    const key = conflictKey(table);
    for (let index = 0; index < rows.length; index += 80) {
      const chunk = rows.slice(index, index + 80);
      const { error } = await supabase.from(table).upsert(chunk, { onConflict: key });
      if (error) return { ok: false, message: `Could not import ${table}: ${error.message}` };
    }
    imported.push(`${table} (${rows.length})`);
  }
  if (!imported.length) return { ok: false, message: "That CSV had no rows to import." };
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/tasks");
  revalidatePath("/inventory");
  revalidatePath("/");
  return { ok: true, message: `Imported ${imported.join(", ")}.` };
}

export async function resetPlatform(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff();
  if (String(formData.get("confirmation") ?? "").trim() !== "RESET") {
    return { ok: false, message: "Type RESET to confirm." };
  }
  const supabase = await createDeskClient();
  const tables = ["activities", "tasks", "appointments", "leads", "customers", "vehicle_ratings", "vehicle_images", "vehicles"] as const;
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return { ok: false, message: `Could not clear ${table}: ${error.message}` };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/leads");
  revalidatePath("/inventory");
  revalidatePath("/");
  return { ok: true, message: "Desk data was reset." };
}
