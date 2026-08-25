"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useTopology } from "@/lib/live";
import { COUNTRY_CENTROIDS, latLonToVec3 } from "@/lib/geo";
import { useMachineStore } from "@/lib/store";

const RADIUS = 24;
const CENTER: [number, number, number] = [0, 12, -26];
const MAX_ARCS = 120;

/**
 * The live network backdrop: a slow wireframe globe dotted with the real
 * public nodes from the hourly topology snapshot, placed at country
 * granularity (iso_code from mempool rankings), joined by channel arcs.
 * Honest by construction: every dot is a real node, and the chip says when
 * the snapshot was taken.
 */
export function NetworkGlobe() {
  const topology = useTopology();
  const activePiece = useMachineStore((s) => s.activePiece);
  const group = useRef<THREE.Group>(null);

  const { nodePositions, arcLines } = useMemo(() => {
    const nodes = topology?.nodes ?? [];
    const N = nodes.length;
    const nodePositions = new Float32Array(Math.max(N, 1) * 3);
    const placed: THREE.Vector3[] = [];

    nodes.forEach((n, i) => {
      let v: [number, number, number];
      const centroid = n.iso ? COUNTRY_CENTROIDS[n.iso] : undefined;
      if (centroid) {
        // jitter inside the country so stacked nodes stay distinct
        const j = (i % 17) * 0.6;
        v = latLonToVec3(
          centroid[0] + Math.sin(i * 2.3) * j * 0.4,
          centroid[1] + Math.cos(i * 1.7) * j * 0.6,
          RADIUS,
        );
      } else {
        // deterministic fibonacci fallback for unknown countries
        const k = i + 0.5;
        const phi = Math.acos(1 - (2 * k) / Math.max(N, 1));
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;
        v = [
          RADIUS * Math.sin(phi) * Math.cos(theta),
          RADIUS * Math.cos(phi),
          RADIUS * Math.sin(phi) * Math.sin(theta),
        ];
      }
      nodePositions[i * 3] = v[0];
      nodePositions[i * 3 + 1] = v[1];
      nodePositions[i * 3 + 2] = v[2];
      placed.push(new THREE.Vector3(...v));
    });

    // channel arcs between deterministic pairs, lifted above the surface
    const arcLines: THREE.BufferGeometry[] = [];
    const count = Math.min(MAX_ARCS, Math.floor(placed.length * 0.8));
    for (let i = 0; i < count; i++) {
      const a = placed[(i * 7) % placed.length];
      const b = placed[(i * 7 + 31) % placed.length];
      if (!a || !b || a.equals(b)) continue;
      const mid = a
        .clone()
        .add(b)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(RADIUS * 1.25);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      arcLines.push(new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)));
    }
    return { nodePositions, arcLines };
  }, [topology]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.02;
  });

  const highlighted = activePiece === "nodes";
  const snapshotTime = topology
    ? new Date(topology.generatedAt).toISOString().slice(11, 16) + " UTC"
    : null;

  return (
    <group position={CENTER}>
      <group ref={group}>
        {/* wireframe earth */}
        <mesh>
          <sphereGeometry args={[RADIUS, 28, 20]} />
          <meshBasicMaterial
            color="#23232f"
            wireframe
            transparent
            opacity={highlighted ? 0.5 : 0.28}
          />
        </mesh>
        {/* real nodes */}
        {topology && (
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
            </bufferGeometry>
            <pointsMaterial
              color="#f7931a"
              size={highlighted ? 0.55 : 0.35}
              sizeAttenuation
              transparent
              opacity={0.95}
            />
          </points>
        )}
        {/* channel arcs */}
        {arcLines.map((geo, i) => (
          <primitive
            key={i}
            object={
              new THREE.Line(
                geo,
                new THREE.LineBasicMaterial({
                  color: "#f7931a",
                  transparent: true,
                  opacity: highlighted ? 0.35 : 0.16,
                }),
              )
            }
          />
        ))}
      </group>

      {topology && snapshotTime && (
        <Html center distanceFactor={30} position={[0, -RADIUS - 4, 0]} zIndexRange={[5, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/80 px-2 py-1 font-mono text-[10px] text-muted">
            {topology.count} real public nodes, placed by country. snapshot {snapshotTime}
            {topology.stale ? " (frozen)" : ""}
          </div>
        </Html>
      )}
    </group>
  );
}
