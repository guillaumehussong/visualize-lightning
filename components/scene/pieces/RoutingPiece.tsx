"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useRankings } from "@/lib/live";

/** A routing pylon: rotating radar dish sweeping for paths, hologram graph
 * ring above, light packet riding the live path of real node aliases. */
export function RoutingPiece({ active }: { active: boolean }) {
  const rankings = useRankings();
  const dish = useRef<THREE.Group>(null);
  const holo = useRef<THREE.Group>(null);
  const packet = useRef<THREE.Mesh>(null);

  const { nodes, edges, path } = useMemo(() => {
    const N = 10;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      nodes.push(new THREE.Vector3(Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85));
    }
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < N; i++) edges.push([i, (i + 1) % N]);
    edges.push([0, 5], [2, 7], [4, 9]);
    const path = [0, 5, 7, 3];
    return { nodes, edges, path };
  }, []);

  const pathCurve = useMemo(
    () => new THREE.CatmullRomCurve3(path.map((i) => nodes[i]), true),
    [nodes, path],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dish.current) dish.current.rotation.y = t * 1.1;
    if (holo.current) holo.current.rotation.y = -t * 0.25;
    if (packet.current) {
      const u = (t * 0.3) % 1;
      packet.current.position.copy(pathCurve.getPointAt(u));
    }
  });

  const aliases = rankings?.nodes.slice(0, 5).map((n) => n.alias).join(" · ");

  return (
    <group>
      {/* pylon mast */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.22, 1.6, 8]} />
        <meshStandardMaterial color="#1c1c28" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* cross braces */}
      {[0.3, -0.3].map((y) => (
        <mesh key={y} position={[0, y - 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.5, 0.05, 0.05]} />
          <meshStandardMaterial color="#2a2a38" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {/* rotating radar dish */}
      <group ref={dish} position={[0, 0.7, 0]}>
        <mesh rotation={[Math.PI / 3.2, 0, 0]}>
          <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
          <meshStandardMaterial
            color="#22222e"
            metalness={0.75}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.16, 0.14]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#f7931a" emissive="#f7931a" emissiveIntensity={2} />
        </mesh>
        <pointLight color="#f7931a" intensity={active ? 1.5 : 0.6} distance={3.5} />
      </group>

      {/* hologram graph ring above */}
      <group ref={holo} position={[0, 1.7, 0]}>
        {edges.map(([a, b], i) => {
          const geo = new THREE.BufferGeometry().setFromPoints([nodes[a], nodes[b]]);
          return (
            <primitive
              key={i}
              object={
                new THREE.Line(
                  geo,
                  new THREE.LineBasicMaterial({ color: "#5fd4ff", transparent: true, opacity: 0.5 }),
                )
              }
            />
          );
        })}
        {nodes.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial
              color="#5fd4ff"
              emissive="#5fd4ff"
              emissiveIntensity={path.includes(i) ? (active ? 2 : 1.2) : 0.5}
            />
          </mesh>
        ))}
        <mesh ref={packet}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={3} />
        </mesh>
      </group>

      {active && (
        <Html center distanceFactor={18} position={[0, -1.6, 0]} zIndexRange={[10, 0]}>
          <div className="max-w-[240px] truncate whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            {aliases ? `live path: ${aliases}` : "loading live nodes..."}
          </div>
        </Html>
      )}
    </group>
  );
}
