import { lookup } from "node:dns/promises";

const UNAVAILABLE_MS = 10 * 60_000;
const DNS_MS = 150;
let skipUntil = 0;
let probe: Promise<boolean> | null = null;

function supabaseHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "";
  }
}

async function probeHost() {
  const host = supabaseHost();
  if (!host) {
    skipUntil = Date.now() + UNAVAILABLE_MS;
    return false;
  }
  try {
    await Promise.race([
      lookup(host),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("dns-timeout")), DNS_MS);
      }),
    ]);
    return true;
  } catch {
    skipUntil = Date.now() + UNAVAILABLE_MS;
    return false;
  }
}

export function supabaseUnavailable() {
  return Date.now() < skipUntil;
}

export async function ensureSupabaseAvailable() {
  if (supabaseUnavailable()) return false;
  probe ??= probeHost();
  const ok = await probe;
  if (!ok) probe = null;
  return ok;
}

export function rememberSupabaseFailure(error?: unknown) {
  const text =
    error instanceof Error
      ? `${error.message} ${error.cause ?? ""}`
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : String(error ?? "");
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|getaddrinfo|dns-timeout/i.test(text)) {
    skipUntil = Date.now() + UNAVAILABLE_MS;
  }
}

export async function withSupabaseFallback<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  if (!(await ensureSupabaseAvailable())) return fallback;
  try {
    return await run();
  } catch (error) {
    rememberSupabaseFailure(error);
    return fallback;
  }
}
