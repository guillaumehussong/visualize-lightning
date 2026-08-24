import { getLatestBlocks, getTipHeight } from "@/lib/lightning/blockstream";

export async function GET() {
  try {
    const [tip, blocks] = await Promise.all([getTipHeight(), getLatestBlocks()]);
    return Response.json({
      height: tip.data,
      latest: blocks.data.slice(0, 6),
      fetchedAt: Math.min(tip.fetchedAt, blocks.fetchedAt),
      stale: tip.stale || blocks.stale,
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
