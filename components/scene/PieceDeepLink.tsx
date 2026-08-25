"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PIECES } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

/**
 * Deep link support: /?piece=routing opens that piece on load. Also used for
 * headless QC screenshots per piece.
 */
export function PieceDeepLink() {
  const params = useSearchParams();
  const setActivePiece = useMachineStore((s) => s.setActivePiece);

  useEffect(() => {
    const id = params.get("piece");
    if (id && PIECES.some((p) => p.id === id)) {
      setActivePiece(id);
    }
  }, [params, setActivePiece]);

  return null;
}
