import {
  getLightningHistory,
  getLightningStats,
  getPrices,
} from "@/lib/lightning/mempool";
import { getTipHeight } from "@/lib/lightning/blockstream";

const SATS_PER_BTC = 100_000_000;

export async function GET() {
  try {
    const [stats, history, prices, tip] = await Promise.all([
      getLightningStats(),
      getLightningHistory("week"),
      getPrices(),
      getTipHeight(),
    ]);

    const sorted = [...history.data].sort((a, b) => b.added - a.added);
    const today = sorted[0];
    const yesterday = sorted[1];
    const deltas =
      today && yesterday
        ? {
            channels24h: today.channelCount - yesterday.channelCount,
            capacity24hBtc:
              (today.totalCapacity - yesterday.totalCapacity) / SATS_PER_BTC,
          }
        : null;

    const sections = [stats, history, prices, tip];
    return Response.json({
      network: {
        ...stats.data,
        totalCapacityBtc: stats.data.totalCapacity / SATS_PER_BTC,
        avgCapacityBtc: stats.data.avgCapacity / SATS_PER_BTC,
        medCapacityBtc: stats.data.medCapacity / SATS_PER_BTC,
      },
      deltas,
      price: { usd: prices.data.USD, eur: prices.data.EUR },
      blockHeight: tip.data,
      fetchedAt: Math.min(...sections.map((s) => s.fetchedAt)),
      stale: sections.some((s) => s.stale),
    });
  } catch (err) {
    return Response.json(
      {
        error: "upstream unavailable",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
