"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PIECES } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

const HOME: [number, number, number] = [-14.2, -1.83, 7.8];

/**
 * Watt, the mechanic who maintains the machine. Low-poly primitives, hard hat
 * with a lightning bolt, sitting on a crate in the corner. He watches the
 * active piece and his hat lamp pulses while he speaks.
 */
export function WattAvatar() {
  const activePiece = useMachineStore((s) => s.activePiece);
  const isSpeaking = useMachineStore((s) => s.isSpeaking);
  const head = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const body = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // head tracks the active piece, else gazes at the machine center
    const target = PIECES.find((p) => p.id === activePiece);
    if (head.current) {
      const look = target
        ? new THREE.Vector3(...target.position)
        : new THREE.Vector3(0, 0, 0);
      const world = new THREE.Vector3();
      head.current.getWorldPosition(world);
      const dir = look.sub(world);
      const yaw = Math.atan2(dir.x, dir.z);
      head.current.rotation.y = THREE.MathUtils.damp(
        head.current.rotation.y,
        yaw,
        4,
        0.016,
      );
      head.current.rotation.x = Math.sin(t * 0.8) * 0.04;
    }
    if (body.current) {
      body.current.position.y = Math.sin(t * 1.1) * 0.03;
    }
    if (lamp.current) {
      lamp.current.intensity = isSpeaking
        ? 1.5 + Math.sin(t * 14) * 1.2
        : 0.35;
    }
  });

  return (
    <group position={HOME} rotation={[0, 0.9, 0]}>
      {/* crate: dark machine-grade, orange edge */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.1, 0.7, 1.1]} />
        <meshStandardMaterial color="#15151f" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.71, 0]}>
        <boxGeometry args={[1.14, 0.03, 1.14]} />
        <meshStandardMaterial color="#f7931a" emissive="#f7931a" emissiveIntensity={0.8} />
      </mesh>
      <group ref={body} position={[0, 0.7, 0]}>
        {/* torso */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.62, 0.75, 0.4]} />
          <meshStandardMaterial color="#1a1a26" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* hi-vis stripe */}
        <mesh position={[0, 0.62, 0.21]}>
          <planeGeometry args={[0.62, 0.1]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
        </mesh>
        {/* arms resting on knees */}
        {[-0.38, 0.38].map((x) => (
          <mesh key={x} position={[x, 0.5, 0.22]} rotation={[0.7, 0, 0]}>
            <capsuleGeometry args={[0.09, 0.4, 4, 8]} />
            <meshStandardMaterial color="#1a1a26" roughness={0.6} metalness={0.4} />
          </mesh>
        ))}
        {/* legs bent, sitting */}
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.12, 0.35]} rotation={[1.2, 0, 0]}>
            <capsuleGeometry args={[0.11, 0.45, 4, 8]} />
            <meshStandardMaterial color="#12121c" roughness={0.7} metalness={0.4} />
          </mesh>
        ))}
        {/* head + hard hat */}
        <group ref={head} position={[0, 1.12, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 16, 16]} />
            <meshStandardMaterial color="#d8a075" roughness={0.6} />
          </mesh>
          {/* hat dome + brim */}
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.27, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ffd700" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.03, 20]} />
            <meshStandardMaterial color="#ffd700" roughness={0.4} />
          </mesh>
          {/* lightning bolt on the hat */}
          <mesh position={[0, 0.2, 0.24]} rotation={[0.3, 0, 0.2]}>
            <boxGeometry args={[0.06, 0.22, 0.02]} />
            <meshStandardMaterial color="#f7931a" emissive="#f7931a" emissiveIntensity={1.2} />
          </mesh>
          <pointLight ref={lamp} position={[0, 0.3, 0.4]} color="#ffd700" intensity={0.35} distance={4} />
        </group>
      </group>
    </group>
  );
}
