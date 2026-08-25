/**
 * The 10 pieces of the machine, in payment order (plan section 3).
 * Layout: 9 pieces on a wide arc (the flow of a payment), Settlement as the
 * bedrock at the center, below everything. Positions are scene units.
 */
export interface PieceDef {
  id: string;
  order: number;
  label: string;
  /** one-line teaser shown under the label */
  teaser: string;
  position: [number, number, number];
  /** accent color of the piece */
  color: string;
}

const R = 16;

function arcPoint(index: number, total: number): [number, number, number] {
  // arc from -200deg to +20deg so the flow reads left to right
  const start = (-200 * Math.PI) / 180;
  const end = (20 * Math.PI) / 180;
  const a = start + (index / (total - 1)) * (end - start);
  return [Math.cos(a) * R, 0, Math.sin(a) * R];
}

const FLOW: Array<Omit<PieceDef, "order" | "position">> = [
  { id: "wallet", label: "Wallet", teaser: "where your sats live", color: "#f7931a" },
  { id: "invoice", label: "Invoice", teaser: "a signed payment request", color: "#ffb84d" },
  { id: "channel", label: "Channel", teaser: "a shared 2-of-2 UTXO", color: "#f7931a" },
  { id: "liquidity", label: "Liquidity", teaser: "which way the tube can push", color: "#ffb84d" },
  { id: "htlc", label: "HTLC", teaser: "a safe with two locks", color: "#f7931a" },
  { id: "routing", label: "Routing", teaser: "the sats GPS", color: "#ffb84d" },
  { id: "fees", label: "Fees", teaser: "tiny tolls on the way", color: "#f7931a" },
  { id: "justice", label: "Justice", teaser: "cheat and lose it all", color: "#ffb84d" },
  { id: "nodes", label: "Nodes", teaser: "who runs the network", color: "#f7931a" },
];

export const PIECES: PieceDef[] = [
  ...FLOW.map((p, i) => ({
    ...p,
    order: i + 1,
    position: arcPoint(i, FLOW.length),
  })),
  {
    id: "settlement",
    order: 10,
    label: "Settlement",
    teaser: "the Bitcoin bedrock below",
    color: "#ffd700",
    position: [0, -1.5, 0],
  },
];

export const DEFAULT_CAMERA = {
  position: [0, 13, 30] as [number, number, number],
  target: [0, 1, -2] as [number, number, number],
};

/** Where the camera sits when visiting a piece: in front and slightly above. */
export function pieceCamera(p: PieceDef): {
  position: [number, number, number];
  target: [number, number, number];
} {
  const [x, y, z] = p.position;
  const len = Math.hypot(x, z) || 1;
  const out = 9;
  return {
    position: [x + (x / len) * out, y + 6, z + (z / len) * out],
    target: [x, y + 1, z],
  };
}
