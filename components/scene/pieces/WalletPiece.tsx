"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { satsPerDollar, useLiveStats } from "@/lib/live";

/** A chest with an open lid and sats floating inside. Live: sats per $1. */
export function WalletPiece({ active }: { active: boolean }) {
  const stats = useLiveStats();
  const sats = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!sats.current) return;
    const t = state.clock.elapsedTime;
    sats.current.children.forEach((c, i) => {
      c.position.y = 0.4 + Math.sin(t * 1.4 + i * 1.7) * 0.18;
      c.rotation.y = t * (0.5 + i * 0.1);
    });
  });

  return (
    <group>
      {/* chest body: dark metal vault */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[2.2, 1.2, 1.4]} />
        <meshStandardMaterial color="#15151f" roughness={0.45} metalness={0.7} />
      </mesh>
      {/* open lid */}
      <mesh position={[0, 0.62, -0.62]} rotation={[-1.9, 0, 0]}>
        <boxGeometry args={[2.2, 0.18, 1.4]} />
        <meshStandardMaterial color="#1c1c28" roughness={0.45} metalness={0.7} />
      </mesh>
      {/* emissive seam */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[2.24, 0.04, 1.44]} />
        <meshStandardMaterial color="#f7931a" emissive="#f7931a" emissiveIntensity={1} />
      </mesh>
      {/* floating sats */}
      <group ref={sats}>
        {[...Array(7)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 7) * Math.PI * 2) * 0.7,
              0.4,
              Math.sin((i / 7) * Math.PI * 2) * 0.35,
            ]}
          >
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial
              color="#f7931a"
              emissive="#f7931a"
              emissiveIntensity={active ? 1.6 : 0.8}
            />
          </mesh>
        ))}
      </group>
      {active && stats && (
        <Html center distanceFactor={18} position={[0, -1.6, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            $1 = {satsPerDollar(stats.price.usd).toLocaleString("en-US")} sats
          </div>
        </Html>
      )}
    </group>
  );
}
