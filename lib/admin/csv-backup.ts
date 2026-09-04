export const BACKUP_TABLES = [
  "vehicles",
  "vehicle_images",
  "leads",
  "customers",
  "appointments",
  "tasks",
  "activities",
  "site_socials",
  "site_settings",
] as const;

export type BackupTable = (typeof BACKUP_TABLES)[number];

export const IMPORT_ORDER: BackupTable[] = [
  "customers",
  "vehicles",
  "vehicle_images",
  "leads",
  "appointments",
  "tasks",
  "activities",
  "site_socials",
  "site_settings",
];

export function isBackupTable(value: string): value is BackupTable {
  return (BACKUP_TABLES as readonly string[]).includes(value);
}

export function csvEscape(value: unknown) {
  if (value == null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [keys.join(","), ...rows.map((row) => keys.map((key) => csvEscape(row[key])).join(","))].join("\n");
}

export function parseCsvRows(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i += 1) {
    const char = src[i]!;
    if (quoted) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
          continue;
        }
        quoted = false;
        continue;
      }
      field += char;
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && src[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell !== "") || rows.length > 0) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  if (quoted) throw new Error("CSV has an unclosed quote.");
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function recordsFromCsv(text: string): Record<string, unknown>[] {
  const trimmed = text.trim();
  if (!trimmed || trimmed === "(empty)") return [];
  const rows = parseCsvRows(trimmed);
  const header = rows[0];
  if (!header?.length) return [];
  const keys = header.map((key) => key.trim()).filter(Boolean);
  if (!keys.length) return [];
  return rows.slice(1).flatMap((row) => {
    if (row.every((cell) => cell.trim() === "")) return [];
    const record: Record<string, unknown> = {};
    keys.forEach((key, index) => {
      record[key] = coerceCell(row[index] ?? "");
    });
    return [record];
  });
}

export type BackupSection = { table: BackupTable; rows: Record<string, unknown>[] };

export function parseBackupFile(text: string, tableHint?: string): BackupSection[] {
  const sections = splitBackupSections(text);
  if (sections.length === 1 && !sections[0]!.table) {
    const hinted = tableHint && tableHint !== "auto" && tableHint !== "all" ? tableHint : "";
    if (!isBackupTable(hinted)) {
      throw new Error("This file has no table markers. Choose which desk table to import.");
    }
    return [{ table: hinted, rows: recordsFromCsv(sections[0]!.csv) }];
  }
  const wanted = tableHint && tableHint !== "auto" && tableHint !== "all" ? tableHint : null;
  const parsed: BackupSection[] = [];
  for (const section of sections) {
    if (!isBackupTable(section.table)) continue;
    if (wanted && section.table !== wanted) continue;
    parsed.push({ table: section.table, rows: recordsFromCsv(section.csv) });
  }
  if (!parsed.length) throw new Error("No Premier desk tables found in that CSV.");
  return parsed;
}

function splitBackupSections(text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const marker = /^#\s*table:([a-z_]+)\s*$/i;
  const sections: { table: string; csv: string }[] = [];
  let current: { table: string; lines: string[] } | null = null;
  let sawMarker = false;
  for (const line of lines) {
    const match = line.match(marker);
    if (match) {
      sawMarker = true;
      if (current) sections.push({ table: current.table, csv: current.lines.join("\n") });
      current = { table: match[1]!.toLowerCase(), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) sections.push({ table: current.table, csv: current.lines.join("\n") });
  if (!sawMarker) return [{ table: "", csv: text }];
  return sections;
}

function coerceCell(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

export function conflictKey(table: BackupTable) {
  return table === "site_settings" ? "key" : "id";
}
