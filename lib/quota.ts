/** Per-IP sliding-window quota for the Q&A endpoint. In-memory, per server
 * instance: good enough for a single-VM deployment, documented as such. */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;

export function checkQuota(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_PER_WINDOW - 1 };
  }
  if (b.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  b.count++;
  return { allowed: true, remaining: MAX_PER_WINDOW - b.count };
}

/** Test helper */
export function resetQuotas(): void {
  buckets.clear();
}
