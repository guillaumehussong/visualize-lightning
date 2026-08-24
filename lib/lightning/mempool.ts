import { cached, type CachedResult } from "./cache";
import {
  fetchJsonWithFallback,
  requiredNumber,
  optionalString,
} from "./http";
import type {
  LightningHistoryPoint,
  LightningStats,
  NodeRanking,
  Prices,
  RankingKind,
} from "./types";

/**
 * mempool.space is unreachable from some networks (verified 2026-08-24 from a
 * Starlink CGNAT connection while the VPS answers 200). mempool.emzy.de serves
 * the same open-source API shape and works from both. Every client call goes
 * through these bases in order, never directly from the browser.
 */
export const MEMPOOL_BASES = [
  "https://mempool.space",
  "https://mempool.emzy.de",
];

export function parseLightningStats(raw: unknown): LightningStats {
  const latest = (raw as Record<string, unknown>)?.latest ?? raw;
  const o = latest as Record<string, unknown>;
  return {
    channelCount: requiredNumber(o.channel_count, "channel_count"),
    nodeCount: requiredNumber(o.node_count, "node_count"),
    totalCapacity: requiredNumber(o.total_capacity, "total_capacity"),
    torNodes: requiredNumber(o.tor_nodes, "tor_nodes"),
    clearnetNodes: requiredNumber(o.clearnet_nodes, "clearnet_nodes"),
    unannouncedNodes: requiredNumber(o.unannounced_nodes, "unannounced_nodes"),
    avgCapacity: requiredNumber(o.avg_capacity, "avg_capacity"),
    avgFeeRate: requiredNumber(o.avg_fee_rate, "avg_fee_rate"),
    avgBaseFeeMtokens: requiredNumber(
      o.avg_base_fee_mtokens,
      "avg_base_fee_mtokens",
    ),
    medCapacity: requiredNumber(o.med_capacity, "med_capacity"),
    medFeeRate: requiredNumber(o.med_fee_rate, "med_fee_rate"),
  };
}

export function parseHistory(raw: unknown): LightningHistoryPoint[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("history: expected non-empty array");
  }
  return raw.map((p) => {
    const o = p as Record<string, unknown>;
    return {
      added: requiredNumber(o.added, "added"),
      channelCount: requiredNumber(o.channel_count, "channel_count"),
      totalCapacity: requiredNumber(o.total_capacity, "total_capacity"),
    };
  });
}

export function parseRankings(raw: unknown): NodeRanking[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("rankings: expected non-empty array");
  }
  return raw.map((n) => {
    const o = n as Record<string, unknown>;
    const publicKey = optionalString(o.publicKey);
    if (!publicKey) throw new Error("ranking entry missing publicKey");
    const country = o.country as Record<string, unknown> | null;
    return {
      publicKey,
      alias: optionalString(o.alias) ?? "(unnamed)",
      channels: requiredNumber(o.channels, "channels"),
      capacity: requiredNumber(o.capacity, "capacity"),
      isoCode: optionalString(o.iso_code),
      countryEn: country ? optionalString(country.en) : null,
    };
  });
}

export function parseMempoolPrices(raw: unknown): Prices {
  const o = raw as Record<string, unknown>;
  return {
    USD: requiredNumber(o.USD, "USD"),
    EUR: requiredNumber(o.EUR, "EUR"),
  };
}

export function parseCoingeckoPrices(raw: unknown): Prices {
  const btc = (raw as Record<string, unknown>)?.bitcoin as Record<
    string,
    unknown
  >;
  if (!btc) throw new Error("coingecko: missing bitcoin key");
  return {
    USD: requiredNumber(btc.usd, "bitcoin.usd"),
    EUR: requiredNumber(btc.eur, "bitcoin.eur"),
  };
}

export function getLightningStats(): Promise<CachedResult<LightningStats>> {
  return cached("mempool:stats", 60_000, () =>
    fetchJsonWithFallback(
      MEMPOOL_BASES,
      "/api/v1/lightning/statistics/latest",
      parseLightningStats,
    ),
  );
}

export function getLightningHistory(
  interval: "week" | "month" = "week",
): Promise<CachedResult<LightningHistoryPoint[]>> {
  return cached(`mempool:history:${interval}`, 600_000, () =>
    fetchJsonWithFallback(
      MEMPOOL_BASES,
      `/api/v1/lightning/statistics/${interval}`,
      parseHistory,
    ),
  );
}

export function getNodeRankings(
  kind: RankingKind,
): Promise<CachedResult<NodeRanking[]>> {
  return cached(`mempool:rankings:${kind}`, 300_000, () =>
    fetchJsonWithFallback(
      MEMPOOL_BASES,
      `/api/v1/lightning/nodes/rankings/${kind}`,
      parseRankings,
    ),
  );
}

export function getPrices(): Promise<CachedResult<Prices>> {
  return cached("price:btc", 60_000, async () => {
    try {
      return await fetchJsonWithFallback(
        MEMPOOL_BASES,
        "/api/v1/prices",
        parseMempoolPrices,
      );
    } catch {
      return await fetchJsonWithFallback(
        ["https://api.coingecko.com"],
        "/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur",
        parseCoingeckoPrices,
      );
    }
  });
}
