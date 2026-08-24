/**
 * Regenerates public/data/topology.json: a merged, deduped snapshot of the
 * network's top public nodes (connectivity + capacity + liquidity rankings).
 * Run on the server hourly via cron. Keeps the file lean: short keys, no
 * duplication. Globe positions are computed client-side (deterministic
 * fibonacci sphere), so the JSON carries only real node facts.
 *
 * Usage: npm run snapshot:topology
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getNodeRankings } from "../lib/lightning/mempool";
import type { NodeRanking, RankingKind } from "../lib/lightning/types";

const KINDS: RankingKind[] = ["connectivity", "capacity", "liquidity"];
const MAX_NODES = 2000;

interface SlimNode {
  pk: string;
  a: string;
  c: number;
  cap: number;
  iso: string | null;
}

function slim(n: NodeRanking): SlimNode {
  return { pk: n.publicKey, a: n.alias, c: n.channels, cap: n.capacity, iso: n.isoCode };
}

async function main() {
  const byPk = new Map<string, SlimNode>();
  let kindsOk = 0;
  for (const kind of KINDS) {
    try {
      const res = await getNodeRankings(kind);
      kindsOk++;
      console.log(
        `${kind}: ${res.data.length} nodes${res.stale ? " (STALE cache)" : ""}`,
      );
      for (const n of res.data) {
        const existing = byPk.get(n.publicKey);
        if (!existing || n.channels > existing.c) {
          byPk.set(n.publicKey, slim(n));
        }
      }
    } catch (err) {
      // Some mirrors (mempool.emzy.de) only expose a subset of lightning
      // endpoints. Degrade honestly: keep what we could fetch.
      console.warn(
        `${kind}: unavailable (${err instanceof Error ? err.message : err}), continuing`,
      );
    }
  }
  if (kindsOk === 0) {
    throw new Error("no ranking source reachable, snapshot not written");
  }

  const nodes = [...byPk.values()]
    .sort((a, b) => b.c - a.c)
    .slice(0, MAX_NODES);

  const payload = {
    generatedAt: Date.now(),
    count: nodes.length,
    nodes,
  };

  const out = path.join(process.cwd(), "public", "data", "topology.json");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(payload));
  const kb = Math.round(JSON.stringify(payload).length / 1024);
  console.log(`wrote ${out}: ${nodes.length} nodes, ${kb} KB`);
}

main().catch((err) => {
  console.error("snapshot failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
