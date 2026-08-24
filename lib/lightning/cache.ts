export interface CachedResult<T> {
  data: T;
  /** Unix ms when the data was fetched from upstream. */
  fetchedAt: number;
  /** true when upstream failed and this is an older cached value. */
  stale: boolean;
}

interface Entry {
  value: unknown;
  fetchedAt: number;
}

const store = new Map<string, Entry>();

/**
 * In-memory TTL cache with honest stale fallback.
 * - Fresh hit (age < ttlMs): returns cached value, no upstream call.
 * - Expired: calls fetcher; on success stores and returns fresh.
 * - Expired + fetcher throws: returns last known value with stale=true.
 * - No cache + fetcher throws: rethrows (caller maps to 502).
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<CachedResult<T>> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && now - hit.fetchedAt < ttlMs) {
    return { data: hit.value as T, fetchedAt: hit.fetchedAt, stale: false };
  }
  try {
    const value = await fetcher();
    store.set(key, { value, fetchedAt: now });
    return { data: value, fetchedAt: now, stale: false };
  } catch (err) {
    if (hit) {
      return { data: hit.value as T, fetchedAt: hit.fetchedAt, stale: true };
    }
    throw err;
  }
}

/** Test helper: wipe the cache between tests. */
export function clearCache(): void {
  store.clear();
}
