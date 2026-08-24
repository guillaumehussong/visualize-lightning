import { cached, type CachedResult } from "./cache";
import { fetchJsonWithFallback, requiredNumber, optionalString } from "./http";
import { MEMPOOL_BASES } from "./mempool";
import type { BlockSummary } from "./types";

/**
 * blockstream.info answers from every network tested (home Starlink + VPS).
 * mempool.space mirrors expose the same Esplora endpoints, so they double as
 * fallbacks with the identical response shape.
 */
const BLOCK_BASES = ["https://blockstream.info", ...MEMPOOL_BASES];

function parseTipHeight(raw: unknown): number {
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (typeof n !== "number" || !Number.isInteger(n) || n <= 0) {
    throw new Error("invalid tip height");
  }
  return n;
}

function parseBlocks(raw: unknown): BlockSummary[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("blocks: expected non-empty array");
  }
  return raw.slice(0, 10).map((b) => {
    const o = b as Record<string, unknown>;
    const id = optionalString(o.id);
    if (!id) throw new Error("block missing id");
    return {
      id,
      height: requiredNumber(o.height, "height"),
      timestamp: requiredNumber(o.timestamp, "timestamp"),
      txCount: requiredNumber(o.tx_count, "tx_count"),
      size: requiredNumber(o.size, "size"),
    };
  });
}

export function getTipHeight(): Promise<CachedResult<number>> {
  return cached("blocks:tip", 30_000, () =>
    fetchJsonWithFallback(BLOCK_BASES, "/api/blocks/tip/height", parseTipHeight),
  );
}

export function getLatestBlocks(): Promise<CachedResult<BlockSummary[]>> {
  return cached("blocks:latest", 60_000, () =>
    fetchJsonWithFallback(BLOCK_BASES, "/api/blocks", parseBlocks),
  );
}
