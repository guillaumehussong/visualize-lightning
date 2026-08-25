"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useLiveStats } from "@/lib/live";

const SATS = 90; // particles streaming inside the pipe

/** Industrial high-pressure conduit between two node pylons: flanged pipe,
 * bolts, pressure gauge, liquid split drifting inside, and a live stream of
 * sat particles flowing through the glass section. Live: channel count
 * + total network capacity. */
export function ChannelPiece({ active }: { active: boolean }) {
  const stats = useLiveStats();
  const liquidL = useRef<THREE.Mesh>(null);
  const liquidR = useRef<THREE.Mesh>(null);
  const needle = useRef<THREE.Mesh>(null);
  const sats = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      [...Array(SATS)].map(() => ({
        offset: Math.random(),
        radius: 0.05 + Math.random() * 0.16,
        angle: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.7,
      })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const split = 0.5 + Math.sin(t * 0.5) * 0.25;
    if (liquidL.current) {
      liquidL.current.scale.x = split;
      liquidL.current.position.x = -1.5 + split * 1.5;
    }
    if (liquidR.current) {
      liquidR.current.scale.x = 1 - split;
      liquidR.current.position.x = 1.5 - (1 - split) * 1.5;
    }
    if (needle.current) {
      needle.current.rotation.z = -0.6 + split * 1.2;
    }
    // sats flow through the pipe; direction flips with the balance drift
    if (sats.current) {
      const dir = Math.sign(Math.cos(t * 0.5)) || 1;
      for (let i = 0; i < SATS; i++) {
        const s = seeds[i];
        const u = (s.offset + t * s.speed * 0.12 * dir) % 1;
        const x = (u < 0 ? u + 1 : u) * 2.4 - 1.2;
        dummy.position.set(
          x,
          Math.cos(s.angle) * s.radius,
          Math.sin(s.angle) * s.radius,
        );
        const pulse = 0.5 + 0.5 * Math.sin(t * 3 + i);
        dummy.scale.setScalar(0.6 + pulse * 0.5);
        dummy.updateMatrix();
        sats.current.setMatrixAt(i, dummy.matrix);
      }
      sats.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* node pylons */}
      {[-1.5, 1.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.55, 24, 24]} />
            <meshStandardMaterial
              color="#1a1a26"
              emissive="#f7931a"
              emissiveIntensity={active ? 0.7 : 0.35}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
          {/* flange collar */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.58, 0.07, 8, 24]} />
            <meshStandardMaterial color="#2a2a38" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* main pipe: glass section + metal flanges at both ends */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 3, 24, 1, true]} />
        <meshStandardMaterial
          color="#8a8a9a"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <group key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.18, 20]} />
            <meshStandardMaterial color="#22222e" metalness={0.8} roughness={0.35} />
          </mesh>
          {/* flange bolts */}
          {[...Array(6)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 6) * Math.PI * 2) * 0.42,
                0,
                Math.sin((i / 6) * Math.PI * 2) * 0.42,
              ]}
            >
              <cylinderGeometry args={[0.045, 0.045, 0.24, 6]} />
              <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
        </group>
      ))}

      {/* liquid halves */}
      <mesh ref={liquidL} rotation={[0, 0, Math.PI / 2]} position={[-0.75, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 3, 16]} />
        <meshStandardMaterial color="#f7931a" emissive="#f7931a" emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={liquidR} rotation={[0, 0, Math.PI / 2]} position={[0.75, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 3, 16]} />
        <meshStandardMaterial color="#ffb84d" emissive="#ffb84d" emissiveIntensity={0.6} />
      </mesh>

      {/* sat particle stream inside the glass pipe */}
      <instancedMesh ref={sats} args={[undefined, undefined, SATS]} frustumCulled={false}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={active ? 2.4 : 1.4}
        />
      </instancedMesh>

      {/* pressure gauge on top */}
      <group position={[0, 0.85, 0]}>
        <mesh>
          <cylinderGeometry args={[0.28, 0.28, 0.1, 20]} />
          <meshStandardMaterial color="#1a1a26" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.24, 20]} />
          <meshStandardMaterial color="#e8e8f0" />
        </mesh>
        <mesh ref={needle} position={[0, 0.07, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.2]} />
          <meshStandardMaterial color="#f7931a" emissive="#f7931a" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshStandardMaterial color="#2a2a38" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

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
