"use client";

import { useEffect } from "react";
import { copy } from "@/lib/copy";
import { PIECES } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

/**
 * Left-side index of the machine. Click or arrow keys to travel.
 */
export function PieceNav() {
  const activePiece = useMachineStore((s) => s.activePiece);
  const setActivePiece = useMachineStore((s) => s.setActivePiece);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const idx = PIECES.findIndex((p) => p.id === activePiece);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const next = PIECES[(idx + 1) % PIECES.length];
        setActivePiece(next.id);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prev = PIECES[(idx - 1 + PIECES.length) % PIECES.length];
        setActivePiece(prev.id);
      } else if (e.key === "Escape") {
        setActivePiece(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePiece, setActivePiece]);

  return (
    <nav className="fixed left-4 top-20 z-10 hidden w-44 md:block">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
        {copy.nav.title}
      </p>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => setActivePiece(null)}
            className={`w-full rounded px-2 py-1 text-left text-sm transition-colors ${
              activePiece === null
                ? "bg-panel text-accent-soft"
                : "text-muted hover:text-foreground"
            }`}
          >
            00 {copy.nav.overview}
          </button>
        </li>
        {PIECES.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => setActivePiece(p.id === activePiece ? null : p.id)}
              className={`w-full rounded px-2 py-1 text-left text-sm transition-colors ${
                activePiece === p.id
                  ? "bg-panel text-accent-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {String(p.order).padStart(2, "0")} {p.label}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted">{copy.nav.hint}</p>
    </nav>
  );
}
