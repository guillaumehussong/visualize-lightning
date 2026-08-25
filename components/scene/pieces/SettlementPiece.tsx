"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useBlocks } from "@/lib/live";

/** Layered bedrock slabs; real latest Bitcoin blocks rise through the rock
 * as glowing bricks. Live: block height + latest blocks. */
export function SettlementPiece({ active }: { active: boolean }) {
  const blocks = useBlocks();
  const bricksRef = useRef<THREE.Group>(null);

  const layers = useMemo(
    () => [
      { y: -0.2, w: 3.6, h: 0.35, c: "#15151f" },
      { y: 0.15, w: 3.2, h: 0.3, c: "#1c1c2a" },
      { y: 0.45, w: 2.7, h: 0.28, c: "#23232f" },
    ],
    [],
  );

  useFrame((state) => {
    if (!bricksRef.current) return;
    const t = state.clock.elapsedTime;
    bricksRef.current.children.forEach((b, i) => {
      const phase = (t * 0.25 + i * 0.2) % 1;
      b.position.y = 0.6 + phase * 1.4;
      const m = (b as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = 1 - phase;
    });
  });

  return (
    <group>
      {/* bedrock layers */}
      {layers.map((l, i) => (
        <mesh key={i} position={[0, l.y, 0]}>
          <boxGeometry args={[l.w, l.h, 2.2]} />
          <meshStandardMaterial color={l.c} roughness={0.9} />
        </mesh>
      ))}
      {/* rising blocks (one per recent real block) */}
      <group ref={bricksRef}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[-1 + i * 0.5, 0.6, 0]}>
            <boxGeometry args={[0.32, 0.32, 0.32]} />
            <meshStandardMaterial
              color="#f7931a"
              emissive="#f7931a"
              emissiveIntensity={active ? 1.4 : 0.8}
              transparent
            />
          </mesh>
        ))}
      </group>
      {/* anchor rods from the machine above */}
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 8]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {active && blocks && (
        <Html center distanceFactor={18} position={[0, -1.1, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            block {blocks.height.toLocaleString("en-US")}, last one had{" "}
            {blocks.latest[0]?.txCount.toLocaleString("en-US")} txs
          </div>
        </Html>
      )}
    </group>
  );
}
