import { readFile } from "node:fs/promises";
import path from "node:path";
import { cached } from "@/lib/lightning/cache";

interface TopologyFile {
  generatedAt: number;
  count: number;
  nodes: unknown[];
}

async function loadSnapshot(): Promise<TopologyFile> {
  const file = path.join(process.cwd(), "public", "data", "topology.json");
  const raw = await readFile(file, "utf8");
  const parsed = JSON.parse(raw) as TopologyFile;
  if (
    typeof parsed.generatedAt !== "number" ||
    typeof parsed.count !== "number" ||
    !Array.isArray(parsed.nodes)
  ) {
    throw new Error("topology.json: invalid shape");
  }
  return parsed;
}

export async function GET() {
  try {
    const snap = await cached("topology:file", 3_600_000, loadSnapshot);
    return Response.json({
      generatedAt: snap.data.generatedAt,
      count: snap.data.count,
      nodes: snap.data.nodes,
      fetchedAt: snap.fetchedAt,
      stale: snap.stale,
    });
  } catch {
    return Response.json(
      {
        error: "topology snapshot missing",
        hint: "run `npm run snapshot:topology` to generate public/data/topology.json",
      },
      { status: 503 },
    );
  }
}
