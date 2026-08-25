"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/** A hexagonal safe with two locks: a spinning hashlock ring and a clock
 * timelock. Periodically unlocks with a glow burst. Live: protocol constant. */
export function HtlcPiece({ active }: { active: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const hand = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring.current) ring.current.rotation.z = t * 1.2;
    if (hand.current) hand.current.rotation.z = -t * 0.8;
    if (glow.current) {
      // unlock burst every ~6s
      const cycle = t % 6;
      glow.current.intensity = cycle < 0.5 ? 6 : active ? 1.2 : 0.5;
    }
  });

  return (
    <group>
      {/* hex safe body */}
      <mesh>
        <cylinderGeometry args={[0.95, 0.95, 1.1, 6]} />
        <meshStandardMaterial color="#2a2a38" roughness={0.4} metalness={0.7} />
      </mesh>
      <pointLight ref={glow} position={[0, 0.9, 0]} color="#f7931a" intensity={0.8} />
      {/* hashlock: spinning ring with notches */}
      <group position={[-0.55, 0.75, 0]}>
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.07, 8, 24]} />
          <meshStandardMaterial
            color="#f7931a"
            emissive="#f7931a"
            emissiveIntensity={active ? 1.2 : 0.6}
          />
        </mesh>
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.22]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* timelock: clock */}
      <group position={[0.55, 0.75, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.08, 24]} />
          <meshStandardMaterial color="#1a1a26" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh ref={hand} position={[0, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.24]} />
          <meshStandardMaterial color="#eee" emissive="#eee" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <Html center distanceFactor={18} position={[0, -1.6, 0]} zIndexRange={[10, 0]}>
        <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
          up to 483 HTLCs per channel
        </div>
      </Html>
    </group>
  );
}
