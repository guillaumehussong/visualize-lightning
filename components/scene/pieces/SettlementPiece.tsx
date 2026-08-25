"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useBlocks } from "@/lib/live";

/** A pile driver anchoring the machine into the Bitcoin bedrock: the hammer
 * slams on each new block, glowing block-bricks rise from the rock. Live:
 * block height + latest real blocks. */
export function SettlementPiece({ active }: { active: boolean }) {
  const blocks = useBlocks();
  const hammer = useRef<THREE.Group>(null);
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
    const t = state.clock.elapsedTime;
    if (hammer.current) {
      // slow rise, fast slam, dwell
      const cycle = t % 5;
      const y =
        cycle < 3
          ? 2.2 + cycle * 0.25
          : cycle < 3.25
            ? 2.95 - ((cycle - 3) / 0.25) * 1.6
            : 1.35;
      hammer.current.position.y = y;
    }
    if (bricksRef.current) {
      bricksRef.current.children.forEach((b, i) => {
        const phase = (t * 0.2 + i * 0.2) % 1;
        b.position.y = 0.6 + phase * 1.3;
        const m = (b as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = 1 - phase;
      });
    }
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

      {/* guide rails */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.7, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2.6, 8]} />
          <meshStandardMaterial color="#2a2a38" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* crosshead */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[1.9, 0.14, 0.3]} />
        <meshStandardMaterial color="#22222e" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* the hammer */}
      <group ref={hammer} position={[0, 2.2, 0]}>
        <mesh>
          <boxGeometry args={[0.55, 0.5, 0.55]} />
          <meshStandardMaterial
            color="#f7931a"
            emissive="#f7931a"
            emissiveIntensity={active ? 0.9 : 0.5}
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>
        <pointLight color="#f7931a" intensity={active ? 1.2 : 0.5} distance={3} />
      </group>

      {/* rising block-bricks */}
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

      {/* anchor rods tying the machine to the rock */}
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]}>
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
