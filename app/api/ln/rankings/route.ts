import { getNodeRankings } from "@/lib/lightning/mempool";
import type { RankingKind } from "@/lib/lightning/types";

const KINDS: RankingKind[] = ["connectivity", "capacity", "liquidity"];

export async function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind") ?? "connectivity";
  if (!KINDS.includes(kind as RankingKind)) {
    return Response.json(
      { error: `invalid kind, expected one of: ${KINDS.join(", ")}` },
      { status: 400 },
    );
  }
  try {
    const rankings = await getNodeRankings(kind as RankingKind);
    return Response.json({
      kind,
      nodes: rankings.data.slice(0, 25),
      fetchedAt: rankings.fetchedAt,
      stale: rankings.stale,
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
