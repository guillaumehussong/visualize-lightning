"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { PieceDef } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

/**
 * Phase 2 placeholder: a glowing named marker for each piece. Real sculpted
 * pieces replace this in phase 3, keeping the same id/position contract.
 */
export function PieceBox({ piece }: { piece: PieceDef }) {
  const activePiece = useMachineStore((s) => s.activePiece);
  const setActivePiece = useMachineStore((s) => s.setActivePiece);
  const isActive = activePiece === piece.id;
  const [hovered, setHovered] = useState(false);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.3 + piece.order;
    const target = isActive ? 1.35 : hovered ? 1.15 : 1;
    mesh.current.scale.setScalar(
      THREE.MathUtils.lerp(mesh.current.scale.x, target, 0.12),
    );
  });

  return (
    <group position={piece.position}>
      <mesh
        ref={mesh}
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
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshStandardMaterial
          color={piece.color}
          emissive={piece.color}
          emissiveIntensity={isActive ? 1.6 : hovered ? 0.9 : 0.45}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>
      <Html center distanceFactor={18} position={[0, 1.8, 0]} zIndexRange={[20, 0]}>
        <button
          onClick={() => setActivePiece(isActive ? null : piece.id)}
          className="pointer-events-auto select-none whitespace-nowrap text-center"
        >
          <span
            className={`block font-mono text-sm tracking-wide ${
              isActive ? "text-accent-soft" : "text-foreground"
            }`}
          >
            {String(piece.order).padStart(2, "0")} {piece.label}
          </span>
          <span className="block text-[11px] text-muted">{piece.teaser}</span>
        </button>
      </Html>
    </group>
  );
}
