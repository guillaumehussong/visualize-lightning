"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useLiveStats, useTopology } from "@/lib/live";

/** A constellation of real public nodes from the live topology snapshot,
 * sized by channel count, slowly rotating. */
export function NodesPiece({ active }: { active: boolean }) {
  const topology = useTopology();
  const stats = useLiveStats();
  const group = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    if (!topology) return null;
    const nodes = topology.nodes.slice(0, 148);
    const N = nodes.length;
    const pos = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const maxC = Math.max(...nodes.map((n) => n.c), 1);
    for (let i = 0; i < N; i++) {
      // deterministic fibonacci sphere
      const k = i + 0.5;
      const phi = Math.acos(1 - (2 * k) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const r = 1.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 0.03 + (nodes[i].c / maxC) * 0.25;
    }
    return { pos, sizes };
  }, [topology]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  return (
    <group>
      <group ref={group}>
        {points && (
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[points.pos, 3]} />
              <bufferAttribute attach="attributes-size" args={[points.sizes, 1]} />
            </bufferGeometry>
            <pointsMaterial
              color="#f7931a"
              size={active ? 0.12 : 0.08}
              sizeAttenuation
              transparent
              opacity={0.95}
            />
          </points>
        )}
        {/* wire sphere hint */}
        <mesh>
          <sphereGeometry args={[1.5, 16, 12]} />
          <meshBasicMaterial color="#23232f" wireframe transparent opacity={0.25} />
        </mesh>
      </group>
      {active && stats && (
        <Html center distanceFactor={18} position={[0, -2.1, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            {stats.network.nodeCount.toLocaleString("en-US")} public nodes live
            {topology ? `, showing top ${topology.count} real ones` : ""}
          </div>
        </Html>
      )}
    </group>
  );
}
