import { getPrices } from "@/lib/lightning/mempool";

export async function GET() {
  try {
    const prices = await getPrices();
    return Response.json({
      usd: prices.data.USD,
      eur: prices.data.EUR,
      fetchedAt: prices.fetchedAt,
      stale: prices.stale,
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
