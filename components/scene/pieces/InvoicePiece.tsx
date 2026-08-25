"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** An unrolled invoice scroll with a pulsing QR block. */
export function InvoicePiece({ active }: { active: boolean }) {
  const scroll = useRef<THREE.Group>(null);
  const qr = useRef<THREE.Mesh>(null);

  // deterministic QR-ish pattern
  const cells = useMemo(() => {
    const out: Array<[number, number]> = [];
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let x = 0; x < 9; x++)
      for (let y = 0; y < 9; y++) if (rand() > 0.52) out.push([x, y]);
    return out;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (scroll.current) scroll.current.rotation.y = Math.sin(t * 0.4) * 0.25;
    if (qr.current) {
      const m = qr.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = (active ? 0.9 : 0.5) + Math.sin(t * 2.2) * 0.25;
    }
  });

  return (
    <group ref={scroll}>
      {/* terminal slab */}
      <mesh rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[2.6, 1.7]} />
        <meshStandardMaterial color="#15151f" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* emissive data lines */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[-0.55, 0.45 - i * 0.3, 0.02]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[1.1, 0.07]} />
          <meshStandardMaterial color="#f7931a" emissive="#f7931a" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* QR block */}
      <group position={[0.75, 0, 0.02]} rotation={[-0.35, 0, 0]}>
        <mesh ref={qr}>
          <planeGeometry args={[0.95, 0.95]} />
          <meshStandardMaterial
            color="#111"
            emissive="#f7931a"
            emissiveIntensity={0.5}
          />
        </mesh>
        {cells.map(([x, y], i) => (
          <mesh key={i} position={[(x - 4) * 0.1, (4 - y) * 0.1, 0.005]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshStandardMaterial color="#eee" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
