"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useLiveStats } from "@/lib/live";

/** A tube with a sliding liquid wall; a payment pulse travels and bounces
 * back when the level on its side runs out. Live: avg/median channel size. */
export function LiquidityPiece({ active }: { active: boolean }) {
  const stats = useLiveStats();
  const wall = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const wallX = Math.sin(t * 0.4) * 0.9;
    if (wall.current) wall.current.position.x = wallX;
    if (pulse.current) {
      // pulse travels left->right, bounces if the wall blocks it
      const cycle = (t * 0.6) % 2;
      const dir = cycle < 1 ? 1 : -1;
      const phase = cycle < 1 ? cycle : cycle - 1;
      let x = -1.3 + phase * 2.6 * dir * (cycle < 1 ? 1 : 1);
      if (cycle >= 1) x = 1.3 - phase * 2.6;
      const limit = wallX - 0.15 * Math.sign(x - wallX);
      if (Math.abs(x - wallX) < 0.18) x = limit;
      pulse.current.position.x = THREE.MathUtils.clamp(x, -1.3, 1.3);
    }
  });

  return (
    <group>
      {/* tube */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 3.2, 24, 1, true]} />
        <meshStandardMaterial
          color="#8a8a9a"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* liquid fill (visual level follows the wall) */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3.2, 16]} />
        <meshStandardMaterial
          color="#f7931a"
          emissive="#f7931a"
          emissiveIntensity={active ? 0.7 : 0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* the split wall */}
      <mesh ref={wall} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.06, 24]} />
        <meshStandardMaterial color="#eee" emissive="#ffd700" emissiveIntensity={0.5} />
      </mesh>
      {/* payment pulse */}
      <mesh ref={pulse}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
      </mesh>
      {stats && (
        <Html center distanceFactor={18} position={[0, -1.6, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            avg channel {stats.network.avgCapacityBtc.toFixed(3)} BTC, median{" "}
            {stats.network.medCapacityBtc.toFixed(4)} BTC
          </div>
        </Html>
      )}
    </group>
  );
}
