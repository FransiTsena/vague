export function isAbortError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === "AbortError") return true;
  if (e instanceof Error && e.name === "AbortError") return true;
  return false;
}

/** Browser fetch for internal APIs: no caching, bounded wait so UI does not hang on DB/network issues. */
export async function apiFetch(input: string, init?: RequestInit, timeoutMs = 20000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, {
      credentials: "include",
      ...init,
      cache: "no-store",
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
