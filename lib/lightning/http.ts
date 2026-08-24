/**
 * Fetch JSON from the first base URL that answers with HTTP 200 AND passes
 * validation. A validation throw counts as failure and moves to the next base,
 * so a garbled 200 never poisons the cache.
 */
export async function fetchJsonWithFallback<T>(
  bases: string[],
  path: string,
  validate: (raw: unknown) => T,
  timeoutMs = 10_000,
): Promise<T> {
  let lastErr: unknown;
  for (const base of bases) {
    try {
      const res = await fetch(base + path, {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from ${base}${path}`);
      }
      const raw: unknown = await res.json();
      return validate(raw);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`all upstreams failed for ${path}`);
}

export function requiredNumber(value: unknown, field: string): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`missing or invalid numeric field: ${field}`);
  }
  return n;
}

export function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
