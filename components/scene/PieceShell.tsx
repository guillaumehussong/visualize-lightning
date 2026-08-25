"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import type { PieceDef } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

/**
 * Shared interaction shell for every piece: hitbox, hover cursor, label,
 * active state passed down to the visual. Phase 3 pieces render their real
 * sculpted visual as children.
 */
export function PieceShell({
  piece,
  children,
}: {
  piece: PieceDef;
  children: React.ReactNode;
}) {
  const activePiece = useMachineStore((s) => s.activePiece);
  const setActivePiece = useMachineStore((s) => s.setActivePiece);
  const isActive = activePiece === piece.id;
  const [hovered, setHovered] = useState(false);

  return (
    <group position={piece.position}>
      {/* invisible generous hitbox so small details stay clickable */}
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          setActivePiece(isActive ? null : piece.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[4.4, 4.4, 4.4]} />
      </mesh>

      {/* bolted octagonal base plate, uniform machine detail */}
      {piece.id !== "settlement" && (
        <group position={[0, -1.05, 0]}>
          <mesh>
            <cylinderGeometry args={[1.7, 1.85, 0.14, 8]} />
            <meshStandardMaterial color="#181824" roughness={0.45} metalness={0.7} />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 8) * Math.PI * 2) * 1.45,
                0.1,
                Math.sin((i / 8) * Math.PI * 2) * 1.45,
              ]}
            >
              <cylinderGeometry args={[0.07, 0.07, 0.08, 6]} />
              <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {children && <group scale={1.3}>{children}</group>}

      <Html center distanceFactor={18} position={[0, 2.6, 0]} zIndexRange={[20, 0]}>
        <button
          onClick={() => setActivePiece(isActive ? null : piece.id)}
          className="pointer-events-auto select-none whitespace-nowrap text-center"
        >
          <span
            className={`block font-mono text-sm tracking-wide ${
              isActive || hovered ? "text-accent-soft" : "text-foreground"
            }`}
          >
            {String(piece.order).padStart(2, "0")} {piece.label}
          </span>
        </button>
      </Html>
    </group>
  );
}
