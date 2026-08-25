"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/** HTLC as a ratchet-and-pawl mechanism.
 *
 * The big ratchet wheel advances one tooth at a time and can never roll back
 * while the pawl is engaged — that one-way clutch IS the hashlock: without the
 * preimage, funds only move forward. A smaller escapement wheel ticks off the
 * timelock. Every cycle, the "preimage" glows, the release lever lifts the
 * pawl, and the wheel spins freely to settlement — then re-engages.
 *
 * Live: protocol constant (max 483 HTLCs per channel).
 */
const TEETH = 24;
const STEP = (Math.PI * 2) / TEETH;
const CYCLE = 8; // seconds per full lock/resolve cycle
const LOCK_TICKS = 6; // ratchet clicks before release

export function HtlcPiece({ active }: { active: boolean }) {
  const wheel = useRef<THREE.Group>(null);
  const pawl = useRef<THREE.Mesh>(null);
  const lever = useRef<THREE.Mesh>(null);
  const escapeWheel = useRef<THREE.Mesh>(null);
  const anchor = useRef<THREE.Mesh>(null);
  const preimage = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);

  const teeth = useMemo(
    () =>
      [...Array(TEETH)].map((_, i) => {
        const a = (i / TEETH) * Math.PI * 2;
        return { a, x: Math.cos(a) * 0.78, y: Math.sin(a) * 0.78 };
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const phase = t % CYCLE;

    // --- ratchet wheel: quantized forward steps, then free-spin release ---
    if (wheel.current) {
      if (phase < LOCK_TICKS) {
        // ease into each tooth step, never backward
        const k = Math.min(phase, LOCK_TICKS);
        const stepIdx = Math.floor(k);
        const frac = k - stepIdx;
        const eased = stepIdx + frac * frac * (3 - 2 * frac); // smoothstep into the click
        wheel.current.rotation.z = -eased * STEP;
      } else {
        // release: pawl lifted, wheel free-spins backward (settlement unwind)
        const r = phase - LOCK_TICKS;
        const spin = Math.min(r / 1.2, 1);
        wheel.current.rotation.z = -LOCK_TICKS * STEP + spin * spin * LOCK_TICKS * STEP;
      }
    }

    // --- pawl: rocks against the teeth during locking, lifted on release ---
    const releasing = phase >= LOCK_TICKS && phase < LOCK_TICKS + 1.2;
    if (pawl.current) {
      const chatter = phase < LOCK_TICKS ? Math.abs(Math.sin(phase * Math.PI)) * 0.08 : 0;
      pawl.current.rotation.z = (releasing ? 0.55 : 0) + chatter;
    }
    if (lever.current) {
      lever.current.rotation.z = releasing ? -0.4 : 0;
    }

    // --- escapement: ticks once per second for the timelock ---
    if (escapeWheel.current) {
      escapeWheel.current.rotation.z = -Math.floor(t * 2) * (Math.PI / 6);
    }
    if (anchor.current) {
      anchor.current.rotation.z = Math.sin(t * Math.PI * 2) * 0.18;
    }

    // --- preimage: glows at the moment of release ---
    const reveal = phase >= LOCK_TICKS && phase < LOCK_TICKS + 1.2;
    if (preimage.current) {
      const m = preimage.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = reveal ? 3.5 : active ? 0.9 : 0.4;
    }
    if (glow.current) {
      glow.current.intensity = reveal ? 8 : active ? 1.2 : 0.5;
    }
  });

  return (
    <group>
      {/* base plate */}
      <mesh position={[0, -0.95, 0]}>
        <boxGeometry args={[2.6, 0.12, 1.6]} />
        <meshStandardMaterial color="#22222e" metalness={0.7} roughness={0.4} />
      </mesh>
      {[-1.15, 1.15].map((x) =>
        [-0.65, 0.65].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.88, z]}>
            <cylinderGeometry args={[0.06, 0.06, 0.1, 6]} />
            <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.25} />
          </mesh>
        )),
      )}

      {/* ratchet wheel: disc + teeth, facing camera (axis Z) */}
      <group ref={wheel} position={[0, 0.05, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.16, 32]} />
          <meshStandardMaterial color="#1c1c28" metalness={0.8} roughness={0.35} />
        </mesh>
        {teeth.map(({ a, x, y }, i) => (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, a - Math.PI / 12]}>
            {/* asymmetric tooth: shallow face drives, steep face locks */}
            <boxGeometry args={[0.16, 0.1, 0.16]} />
            <meshStandardMaterial
              color="#f7931a"
              emissive="#f7931a"
              emissiveIntensity={active ? 0.55 : 0.3}
              metalness={0.6}
              roughness={0.35}
            />
          </mesh>
        ))}
        {/* hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.3, 12]} />
          <meshStandardMaterial color="#2a2a38" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* pawl: pivoting lever whose tip drops between teeth */}
      <group position={[0.62, 0.98, 0]}>
        <mesh ref={pawl} position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.62, 0.12]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.2, 10]} />
          <meshStandardMaterial color="#22222e" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* release lever (preimage actuator) */}
      <mesh ref={lever} position={[-0.85, 0.9, 0]}>
        <boxGeometry args={[0.08, 0.7, 0.1]} />
        <meshStandardMaterial color="#2a2a38" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* preimage capsule above the lever */}
      <mesh ref={preimage} position={[-0.85, 1.45, 0]}>
        <capsuleGeometry args={[0.11, 0.3, 6, 12]} />
        <meshStandardMaterial
          color="#5fd4ff"
          emissive="#5fd4ff"
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>
      <pointLight ref={glow} position={[-0.85, 1.45, 0.6]} color="#5fd4ff" intensity={0.8} />

      {/* timelock escapement on the side */}
      <group position={[1.35, 0.35, 0]}>
        <mesh ref={escapeWheel} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 12]} />
          <meshStandardMaterial
            color="#5fd4ff"
            emissive="#5fd4ff"
            emissiveIntensity={0.8}
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>
        <mesh ref={anchor} position={[0, 0.42, 0]}>
          <boxGeometry args={[0.5, 0.07, 0.08]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          <meshStandardMaterial color="#2a2a38" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {active && (
        <Html center distanceFactor={18} position={[0, -1.6, 0]} zIndexRange={[10, 0]}>
          <div className="whitespace-nowrap rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[11px] text-accent-soft">
            one-way ratchet: no preimage, no rollback · up to 483 HTLCs per channel
          </div>
        </Html>
      )}
    </group>
  );
}
