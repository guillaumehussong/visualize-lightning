"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/** A bank vault with spinning combination dials (hashlock) and a countdown
 * wheel (timelock). Periodic unlock burst. Live: protocol constant. */
export function HtlcPiece({ active }: { active: boolean }) {
  const dial1 = useRef<THREE.Mesh>(null);
  const dial2 = useRef<THREE.Mesh>(null);
  const wheel = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);
  const door = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dial1.current) dial1.current.rotation.x = t * 1.4;
    if (dial2.current) dial2.current.rotation.x = -t * 0.9;
    if (wheel.current) wheel.current.rotation.z = -t * 0.5;
    if (glow.current) {
      const cycle = t % 6;
      glow.current.intensity = cycle < 0.5 ? 7 : active ? 1.4 : 0.5;
    }
    if (door.current) {
      // door swings open briefly every cycle
      const cycle = t % 6;
      const open = cycle < 0.5 ? cycle / 0.5 : cycle < 1.5 ? 1 : Math.max(0, 1 - (cycle - 1.5));
      door.current.rotation.y = open * 1.6;
    }
  });

  return (
    <group>
      {/* vault body */}
      <mesh>
        <cylinderGeometry args={[0.95, 1.05, 1.3, 8]} />
        <meshStandardMaterial color="#1c1c28" roughness={0.4} metalness={0.75} />
      </mesh>
      {/* rivet ring */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 0.98,
            0.45,
            Math.sin((i / 8) * Math.PI * 2) * 0.98,
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {/* vault door */}
      <mesh ref={door} position={[0, 0, 0.9]}>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 24]} />
        <meshStandardMaterial color="#22222e" metalness={0.8} roughness={0.3} />
      </mesh>
      <pointLight ref={glow} position={[0, 0.2, 1.2]} color="#f7931a" intensity={0.8} />

      {/* combination dials on top */}
      {[-0.4, 0.4].map((x, i) => (
        <group key={x} position={[x, 0.75, 0]}>
          <mesh ref={i === 0 ? dial1 : dial2} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.14, 12]} />
            <meshStandardMaterial
              color="#f7931a"
              emissive="#f7931a"
              emissiveIntensity={active ? 1 : 0.5}
              metalness={0.6}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <boxGeometry args={[0.1, 0.14, 0.1]} />
            <meshStandardMaterial color="#2a2a38" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* countdown wheel on the side */}
      <group position={[0.95, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh ref={wheel}>
          <torusGeometry args={[0.3, 0.06, 8, 24]} />
          <meshStandardMaterial color="#5fd4ff" emissive="#5fd4ff" emissiveIntensity={1} />
        </mesh>
      </group>

      {active && (
        <Html center distanceFactor={18} position={[0, -1.6, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            up to 483 HTLCs per channel
          </div>
        </Html>
      )}
    </group>
  );
}
