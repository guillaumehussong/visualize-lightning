"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useLiveStats } from "@/lib/live";

/** A path of toll arches; a payment stream passes through and sheds sparks
 * at each booth. Live: average fee rate (ppm) and base fee. */
export function FeesPiece({ active }: { active: boolean }) {
  const stats = useLiveStats();
  const sparks = useRef<THREE.Points>(null);

  const sparkData = useMemo(() => {
    const N = 60;
    const pos = new Float32Array(N * 3);
    const speed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = -2 + Math.random() * 4;
      pos[i * 3 + 1] = Math.random() * 0.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      speed[i] = 0.5 + Math.random();
    }
    return { pos, speed, N };
  }, []);

  useFrame((state, delta) => {
    if (!sparks.current) return;
    const attr = sparks.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < sparkData.N; i++) {
      let x = attr.getX(i) + sparkData.speed[i] * delta;
      let y = attr.getY(i);
      // near an arch (x ~ -1, 0, 1): shed upward spark then reset
      for (const ax of [-1, 0, 1]) {
        if (Math.abs(x - ax) < 0.05) y += delta * 3;
      }
      if (x > 2 || y > 1.4) {
        x = -2;
        y = Math.random() * 0.3;
      }
      attr.setXYZ(i, x, y, attr.getZ(i));
    }
    attr.needsUpdate = true;
  });

  return (
    <group>
      {/* ground path */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.4, 0.5]} />
        <meshStandardMaterial color="#1a1a26" />
      </mesh>
      {/* toll arches */}
      {[-1, 0, 1].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.5, 0.06, 8, 20, Math.PI]} />
          <meshStandardMaterial
            color="#f7931a"
            emissive="#f7931a"
            emissiveIntensity={active ? 1.2 : 0.6}
          />
        </mesh>
      ))}
      {/* payment sparks */}
      <points ref={sparks}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffd700" size={0.06} sizeAttenuation />
      </points>
      {stats && (
        <Html center distanceFactor={18} position={[0, -1.4, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            avg toll {stats.network.avgFeeRate} ppm +{" "}
            {(stats.network.avgBaseFeeMtokens / 1000).toFixed(2)} sats base
          </div>
        </Html>
      )}
    </group>
  );
}
