"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useLiveStats } from "@/lib/live";

/** A balance scale rocking gently, a hammer suspended above. Live: net
 * channels opened/closed over 24h (the chain keeps judging). */
export function JusticePiece({ active }: { active: boolean }) {
  const stats = useLiveStats();
  const beam = useRef<THREE.Group>(null);
  const hammer = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (beam.current) beam.current.rotation.z = Math.sin(t * 0.7) * 0.08;
    if (hammer.current) {
      // hammer trembles, drops fast every ~8s, rises back
      const cycle = t % 8;
      const drop = cycle < 0.4 ? cycle / 0.4 : cycle < 2 ? 1 : Math.max(0, 1 - (cycle - 2) / 2);
      hammer.current.position.y = 1.9 - drop * 0.7;
    }
  });

  return (
    <group>
      {/* pole */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 1.6, 12]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* beam + pans */}
      <group ref={beam} position={[0, 1.3, 0]}>
        <mesh>
          <boxGeometry args={[2.6, 0.06, 0.06]} />
          <meshStandardMaterial color="#8a8a9a" metalness={0.7} roughness={0.4} />
        </mesh>
        {[-1.2, 1.2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, -0.35, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
              <meshStandardMaterial color="#8a8a9a" />
            </mesh>
            <mesh position={[0, -0.75, 0]}>
              <cylinderGeometry args={[0.35, 0.18, 0.18, 16]} />
              <meshStandardMaterial
                color="#f7931a"
                emissive="#f7931a"
                emissiveIntensity={active ? 0.9 : 0.4}
              />
            </mesh>
          </group>
        ))}
      </group>
      {/* hammer */}
      <group ref={hammer} position={[0, 1.9, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.22, 0.22]} />
          <meshStandardMaterial color="#2a2a38" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#4a3620" />
        </mesh>
        <pointLight color="#ffd700" intensity={active ? 1.2 : 0.4} distance={3} />
      </group>
      {active && stats?.deltas && (
        <Html center distanceFactor={18} position={[0, -1.3, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            {stats.deltas.channels24h >= 0 ? "+" : ""}
            {stats.deltas.channels24h} channels in 24h
          </div>
        </Html>
      )}
    </group>
  );
}
