"use client";

import { copy } from "@/lib/copy";
import { PIECES } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

/**
 * Compact piece picker for small screens (the side nav is desktop-only).
 * Horizontal scroll chips above the stats bar.
 */
export function MobileNav() {
  const activePiece = useMachineStore((s) => s.activePiece);
  const setActivePiece = useMachineStore((s) => s.setActivePiece);

  return (
    <nav className="fixed inset-x-0 bottom-10 z-10 overflow-x-auto md:hidden">
      <div className="flex gap-1.5 px-3 py-1">
        <button
          onClick={() => setActivePiece(null)}
          className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[11px] ${
            activePiece === null
              ? "border-accent text-accent-soft"
              : "border-border bg-panel/85 text-muted"
          }`}
        >
          {copy.nav.overview}
        </button>
        {PIECES.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePiece(p.id === activePiece ? null : p.id)}
            className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[11px] ${
              activePiece === p.id
                ? "border-accent text-accent-soft"
                : "border-border bg-panel/85 text-muted"
            }`}
          >
            {String(p.order).padStart(2, "0")} {p.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
