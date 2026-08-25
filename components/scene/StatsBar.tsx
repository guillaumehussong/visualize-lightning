"use client";

import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";

interface StatsPayload {
  network: {
    nodeCount: number;
    channelCount: number;
    totalCapacityBtc: number;
    avgFeeRate: number;
  };
  price: { usd: number };
  blockHeight: number;
  fetchedAt: number;
  stale: boolean;
}

const REFRESH_MS = 60_000;

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * The permanent live band, like the reference site's live numbers. Every
 * number comes from /api/ln/stats with its fetch time shown honestly.
 */
export function StatsBar() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/ln/stats");
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as StatsPayload;
        if (!cancelled) {
          setStats(json);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const c = copy.stats;
  const asOf = stats
    ? new Date(stats.fetchedAt).toISOString().slice(11, 16) + " UTC"
    : null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 border-t border-border bg-panel/85 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 font-mono text-xs">
        {error && <span className="text-red-400">{c.liveError}</span>}
        {!error && !stats && <span className="text-muted">...</span>}
        {stats && (
          <>
            <span>
              <strong className="text-accent-soft">{fmt(stats.network.nodeCount)}</strong>{" "}
              <span className="text-muted">{c.nodes}</span>
            </span>
            <span>
              <strong className="text-accent-soft">{fmt(stats.network.channelCount)}</strong>{" "}
              <span className="text-muted">{c.channels}</span>
            </span>
            <span>
              <strong className="text-accent-soft">
                {fmt(Math.round(stats.network.totalCapacityBtc))} BTC
              </strong>{" "}
              <span className="text-muted">{c.capacity}</span>
            </span>
            <span>
              <strong className="text-accent-soft">{fmt(stats.network.avgFeeRate)} ppm</strong>{" "}
              <span className="text-muted">{c.avgFee}</span>
            </span>
            <span>
              <strong className="text-accent-soft">{fmt(stats.blockHeight)}</strong>{" "}
              <span className="text-muted">{c.block}</span>
            </span>
            <span>
              <strong className="text-accent-soft">${fmt(stats.price.usd)}</strong>
            </span>
            <span className="ml-auto text-muted">
              {c.dataAsOf} {asOf}
              {stats.stale && (
                <span className="ml-2 rounded border border-amber-600 px-1 text-amber-500">
                  {c.staleBadge}
                </span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
