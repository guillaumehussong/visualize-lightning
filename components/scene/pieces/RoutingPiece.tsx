"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useRankings } from "@/lib/live";

/** A mini graph of real top nodes (from live rankings) with a light packet
 * traveling a computed path. */
export function RoutingPiece({ active }: { active: boolean }) {
  const rankings = useRankings();
  const packet = useRef<THREE.Mesh>(null);

  const { nodes, edges, path } = useMemo(() => {
    // 12 nodes on a tilted disc, deterministic
    const N = 12;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = 1.1 + ((i * 37) % 10) / 22;
      nodes.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a * 2.3) * 0.35, Math.sin(a) * r));
    }
    // edges: ring + some chords
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < N; i++) edges.push([i, (i + 1) % N]);
    edges.push([0, 4], [2, 7], [5, 10], [3, 9], [1, 8]);
    // a visible path across the graph
    const path = [0, 4, 2, 7, 5];
    return { nodes, edges, path };
  }, []);

  const pathCurve = useMemo(
    () => new THREE.CatmullRomCurve3(path.map((i) => nodes[i])),
    [nodes, path],
  );

  useFrame((state) => {
    if (!packet.current) return;
    const t = (state.clock.elapsedTime * 0.25) % 1;
    packet.current.position.copy(pathCurve.getPointAt(t));
  });

  const aliases = rankings?.nodes.slice(0, 5).map((n) => n.alias).join(" · ");

  return (
    <group rotation={[0.35, 0, 0]}>
      {/* edges */}
      {edges.map(([a, b], i) => {
        const geo = new THREE.BufferGeometry().setFromPoints([nodes[a], nodes[b]]);
        return (
          <primitive
            key={i}
            object={
              new THREE.Line(
                geo,
                new THREE.LineBasicMaterial({ color: "#3a3a4a", transparent: true, opacity: 0.8 }),
              )
            }
          />
        );
      })}
      {/* nodes */}
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial
            color="#22222e"
            emissive="#f7931a"
            emissiveIntensity={path.includes(i) ? (active ? 1.4 : 0.9) : 0.35}
          />
        </mesh>
      ))}
      {/* traveling packet */}
      <mesh ref={packet}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#fff" emissive="#ffd700" emissiveIntensity={3} />
      </mesh>
      <Html center distanceFactor={18} position={[0, -1.9, 0]} zIndexRange={[10, 0]}>
        <div className="max-w-[240px] truncate whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
          {aliases ? `live path: ${aliases}` : "loading live nodes..."}
        </div>
      </Html>
    </group>
  );
}
