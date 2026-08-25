"use client";

import { useEffect, useState } from "react";

export interface LiveStats {
  network: {
    nodeCount: number;
    channelCount: number;
    totalCapacityBtc: number;
    avgCapacityBtc: number;
    medCapacityBtc: number;
    avgFeeRate: number;
    avgBaseFeeMtokens: number;
    torNodes: number;
    clearnetNodes: number;
  };
  deltas: { channels24h: number; capacity24hBtc: number } | null;
  price: { usd: number; eur: number };
  blockHeight: number;
  fetchedAt: number;
  stale: boolean;
}

interface RankingNode {
  publicKey: string;
  alias: string;
  channels: number;
  capacity: number;
  isoCode: string | null;
}

interface RankingsPayload {
  nodes: RankingNode[];
  fetchedAt: number;
  stale: boolean;
}

interface TopologyPayload {
  generatedAt: number;
  count: number;
  nodes: Array<{ pk: string; a: string; c: number; cap: number; iso: string | null }>;
  fetchedAt?: number;
  stale?: boolean;
}

interface BlocksPayload {
  height: number;
  latest: Array<{ id: string; height: number; timestamp: number; txCount: number; size: number }>;
  fetchedAt: number;
  stale: boolean;
}

/** Module-level shared promises: one fetch per endpoint per session, all
 * pieces read from the same source. The server cache does the heavy work. */
let statsPromise: Promise<LiveStats> | null = null;
let rankingsPromise: Promise<RankingsPayload> | null = null;
let topologyPromise: Promise<TopologyPayload> | null = null;
let blocksPromise: Promise<BlocksPayload> | null = null;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

function useShared<T>(getPromise: () => Promise<T>): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    let cancelled = false;
    getPromise()
      .then((v) => {
        if (!cancelled) setValue(v);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export function useLiveStats(): LiveStats | null {
  return useShared(() => (statsPromise ??= getJson<LiveStats>("/api/ln/stats")));
}

export function useRankings(): RankingsPayload | null {
  return useShared(
    () => (rankingsPromise ??= getJson<RankingsPayload>("/api/ln/rankings")),
  );
}

export function useTopology(): TopologyPayload | null {
  return useShared(
    () => (topologyPromise ??= getJson<TopologyPayload>("/api/ln/topology")),
  );
}

export function useBlocks(): BlocksPayload | null {
  return useShared(() => (blocksPromise ??= getJson<BlocksPayload>("/api/ln/blocks")));
}

/** sats per 1 USD at the current price */
export function satsPerDollar(priceUsd: number): number {
  return Math.round(100_000_000 / priceUsd);
}
