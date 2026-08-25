"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useLiveStats } from "@/lib/live";

/** Two node spheres joined by a transparent tube; the liquid split drifts.
 * Live: channel count + total network capacity. */
export function ChannelPiece({ active }: { active: boolean }) {
  const stats = useLiveStats();
  const liquidL = useRef<THREE.Mesh>(null);
  const liquidR = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // the split drifts between 25% and 75% like slow tides of payments
    const split = 0.5 + Math.sin(t * 0.5) * 0.25;
    if (liquidL.current) {
      liquidL.current.scale.x = split;
      liquidL.current.position.x = -1.5 + split * 1.5;
    }
    if (liquidR.current) {
      liquidR.current.scale.x = 1 - split;
      liquidR.current.position.x = 1.5 - (1 - split) * 1.5;
    }
  });

  return (
    <group>
      {/* node spheres */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial
            color="#22222e"
            emissive="#f7931a"
            emissiveIntensity={active ? 0.7 : 0.35}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      ))}
      {/* glass tube */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 3, 24, 1, true]} />
        <meshStandardMaterial
          color="#8a8a9a"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* liquid halves */}
      <mesh ref={liquidL} rotation={[0, 0, Math.PI / 2]} position={[-0.75, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 3, 16]} />
        <meshStandardMaterial color="#f7931a" emissive="#f7931a" emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={liquidR} rotation={[0, 0, Math.PI / 2]} position={[0.75, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 3, 16]} />
        <meshStandardMaterial color="#ffb84d" emissive="#ffb84d" emissiveIntensity={0.6} />
      </mesh>
      {active && stats && (
        <Html center distanceFactor={18} position={[0, -1.6, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            {stats.network.channelCount.toLocaleString("en-US")} channels,{" "}
            {Math.round(stats.network.totalCapacityBtc).toLocaleString("en-US")} BTC inside
          </div>
        </Html>
      )}
    </group>
  );
}
