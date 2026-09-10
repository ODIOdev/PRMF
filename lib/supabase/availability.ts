const UNAVAILABLE_MS = 2 * 60_000;
let skipUntil = 0;

export function supabaseUnavailable() {
  return Date.now() < skipUntil;
}

export function rememberSupabaseFailure(error?: unknown) {
  const text =
    error instanceof Error
      ? `${error.message} ${error.cause ?? ""}`
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : String(error ?? "");
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|getaddrinfo|AbortError/i.test(text)) {
    skipUntil = Date.now() + UNAVAILABLE_MS;
  }
}

export async function withSupabaseFallback<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  if (supabaseUnavailable()) return fallback;
  try {
    return await run();
  } catch (error) {
    rememberSupabaseFailure(error);
    return fallback;
  }
}
