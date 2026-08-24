export interface LightningStats {
  channelCount: number;
  nodeCount: number;
  /** sats */
  totalCapacity: number;
  torNodes: number;
  clearnetNodes: number;
  unannouncedNodes: number;
  /** sats */
  avgCapacity: number;
  /** ppm */
  avgFeeRate: number;
  /** msat */
  avgBaseFeeMtokens: number;
  /** sats */
  medCapacity: number;
  /** ppm */
  medFeeRate: number;
}

export interface LightningHistoryPoint {
  /** unix seconds */
  added: number;
  channelCount: number;
  /** sats */
  totalCapacity: number;
}

export interface NodeRanking {
  publicKey: string;
  alias: string;
  channels: number;
  /** sats */
  capacity: number;
  isoCode: string | null;
  countryEn: string | null;
}

export type RankingKind = "connectivity" | "capacity" | "liquidity";

export interface Prices {
  USD: number;
  EUR: number;
}

export interface BlockSummary {
  id: string;
  height: number;
  /** unix seconds */
  timestamp: number;
  txCount: number;
  /** bytes */
  size: number;
}

/** Envelope returned by every /api/ln/* route. */
export interface ApiEnvelope {
  /** oldest upstream fetch time in the payload, unix ms */
  fetchedAt: number;
  stale: boolean;
}
