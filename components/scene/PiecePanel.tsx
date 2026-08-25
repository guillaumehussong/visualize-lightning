"use client";

import { usePieceContent } from "@/lib/useCopy";
import { PIECES } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

/**
 * Right-side detail panel for the active piece: tagline + fact bullets from
 * the piece card (content/pieces.ts). Hidden on the overview.
 */
export function PiecePanel() {
  const activePiece = useMachineStore((s) => s.activePiece);
  const setActivePiece = useMachineStore((s) => s.setActivePiece);
  const PIECE_CONTENT = usePieceContent();
  if (!activePiece) return null;
  const content = PIECE_CONTENT[activePiece];
  const def = PIECES.find((p) => p.id === activePiece);
  if (!content || !def) return null;

  return (
    <aside className="fixed inset-x-4 bottom-24 z-10 rounded-lg border border-border bg-panel/90 p-4 backdrop-blur md:inset-x-auto md:bottom-auto md:right-4 md:top-20 md:w-72">
      <div className="mb-1 flex items-start justify-between">
        <h2 className="font-mono text-sm text-accent-soft">
          {String(def.order).padStart(2, "0")} {content.title}
        </h2>
        <button
          onClick={() => setActivePiece(null)}
          className="text-muted hover:text-foreground"
          aria-label="close"
        >
          x
        </button>
      </div>
      <p className="mb-3 text-xs text-muted">{content.tagline}</p>
      <ul className="space-y-2 text-sm leading-snug">
        {content.facts.map((f, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
