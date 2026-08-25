"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PIECES } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

const SATS_COUNT = 26;
const SIGNAL_COUNT = 22;

/**
 * The machine chassis: ONE continuous bed extruded along the payment arc,
 * with an emissive spine, mount pylons under each piece, the glowing conduit
 * above, and two counter-flowing particle streams (gold sats one way, cyan
 * signals the other). This is what turns scattered icons into ONE engine.
 */
export function MachineFrame() {
  const activePiece = useMachineStore((s) => s.activePiece);
  const sats = useRef<THREE.InstancedMesh>(null);
  const signals = useRef<THREE.InstancedMesh>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const spineMat = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const flowPieces = useMemo(
    () => PIECES.filter((p) => p.id !== "settlement"),
    [],
  );

  // bed curve at chassis height
  const bedCurve = useMemo(() => {
    const pts = flowPieces.map(
      (p) => new THREE.Vector3(p.position[0], p.position[1] - 1.95, p.position[2]),
    );
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
  }, [flowPieces]);

  // conduit curve above the pieces
  const conduitCurve = useMemo(() => {
    const pts = flowPieces.map(
      (p) => new THREE.Vector3(p.position[0], p.position[1] + 1.1, p.position[2] - 1.4),
    );
    pts.push(new THREE.Vector3(0, 0.6, -1.4));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
  }, [flowPieces]);

  // continuous bed: rectangular cross-section extruded along the arc
  const bedGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.7, -0.12);
    shape.lineTo(1.7, -0.12);
    shape.lineTo(1.7, 0.12);
    shape.lineTo(-1.7, 0.12);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      extrudePath: bedCurve,
      steps: 220,
      bevelEnabled: false,
    });
  }, [bedCurve]);

  const spineGeo = useMemo(
    () => new THREE.TubeGeometry(bedCurve, 220, 0.05, 8, false),
    [bedCurve],
  );
  const conduitGeo = useMemo(
    () => new THREE.TubeGeometry(conduitCurve, 220, 0.13, 10, false),
    [conduitCurve],
  );
  const coreGeo = useMemo(
    () => new THREE.TubeGeometry(conduitCurve, 220, 0.05, 8, false),
    [conduitCurve],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (sats.current) {
      for (let i = 0; i < SATS_COUNT; i++) {
        const u = (t * 0.045 + i / SATS_COUNT) % 1;
        dummy.position.copy(conduitCurve.getPointAt(u));
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        sats.current.setMatrixAt(i, dummy.matrix);
      }
      sats.current.instanceMatrix.needsUpdate = true;
    }
    if (signals.current) {
      for (let i = 0; i < SIGNAL_COUNT; i++) {
        // reverse flow inside the conduit, offset so both streams read
        const u = 1 - ((t * 0.06 + i / SIGNAL_COUNT) % 1);
        const pos = conduitCurve.getPointAt(u);
        dummy.position.set(pos.x, pos.y + 0.16, pos.z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        signals.current.setMatrixAt(i, dummy.matrix);
      }
      signals.current.instanceMatrix.needsUpdate = true;
    }
    if (coreMat.current) {
      coreMat.current.emissiveIntensity = 1.3 + Math.sin(t * 2.2) * 0.5;
    }
    if (spineMat.current) {
      spineMat.current.emissiveIntensity = 0.9 + Math.sin(t * 1.4 + 1) * 0.3;
    }
  });

  return (
    <group>
      {/* the continuous bed */}
      <mesh geometry={bedGeo}>
        <meshStandardMaterial color="#101018" roughness={0.55} metalness={0.6} />
      </mesh>
      {/* emissive spine on the bed */}
      <mesh geometry={spineGeo} position={[0, 0.16, 0]}>
        <meshStandardMaterial
          ref={spineMat}
          color="#f7931a"
          emissive="#f7931a"
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* mount pylons under each piece */}
      {flowPieces.map((p) => {
        const isActive = activePiece === p.id;
        return (
          <group key={p.id} position={[p.position[0], p.position[1] - 1.25, p.position[2]]}>
            <mesh>
              <cylinderGeometry args={[0.14, 0.2, 1.4, 8]} />
              <meshStandardMaterial color="#181824" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.05, 12]} />
              <meshStandardMaterial
                color="#f7931a"
                emissive="#f7931a"
                emissiveIntensity={isActive ? 1.8 : 0.6}
              />
            </mesh>
          </group>
        );
      })}

      {/* conduit above: dark outer pipe + emissive core */}
      <mesh geometry={conduitGeo}>
        <meshStandardMaterial color="#15151f" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh geometry={coreGeo}>
        <meshStandardMaterial
          ref={coreMat}
          color="#f7931a"
          emissive="#f7931a"
          emissiveIntensity={1.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* flow direction chevrons along the conduit */}
      {flowPieces.map((p, i) => {
        const u = (i + 0.5) / flowPieces.length;
        const pos = conduitCurve.getPointAt(u);
        const tangent = conduitCurve.getTangentAt(u);
        const yaw = Math.atan2(tangent.x, tangent.z);
        const pitch = Math.asin(THREE.MathUtils.clamp(tangent.y, -1, 1));
        return (
          <mesh
            key={p.id}
            position={[pos.x, pos.y, pos.z]}
            rotation={[-pitch - Math.PI / 2, yaw, 0]}
          >
            <coneGeometry args={[0.16, 0.4, 4]} />
            <meshStandardMaterial
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={1.6}
            />
          </mesh>
        );
      })}

      {/* gold sats flowing forward through the conduit */}
      <instancedMesh ref={sats} args={[undefined, undefined, SATS_COUNT]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={3} />
      </instancedMesh>
      {/* cyan signals flowing back through the conduit */}
      <instancedMesh ref={signals} args={[undefined, undefined, SIGNAL_COUNT]}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshStandardMaterial color="#5fd4ff" emissive="#5fd4ff" emissiveIntensity={3.5} />
      </instancedMesh>
    </group>
  );
}
