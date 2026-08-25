"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, ContactShadows, MeshReflectorMaterial } from "@react-three/drei";
import { DEFAULT_CAMERA, PIECES } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";
import { CameraRig } from "./CameraRig";
import { PieceShell } from "./PieceShell";
import { NetworkGlobe } from "./NetworkGlobe";
import { WattAvatar } from "./WattAvatar";
import { MachineFrame } from "./MachineFrame";
import { MachineEffects } from "./MachineEffects";
import { PIECE_VISUALS } from "./pieces";

/**
 * The machine canvas. Each piece renders its sculpted visual (phase 3)
 * inside the shared interaction shell.
 */
export default function MachineCanvas() {
  const setActivePiece = useMachineStore((s) => s.setActivePiece);
  const activePiece = useMachineStore((s) => s.activePiece);

  return (
    <Canvas
      camera={{ position: DEFAULT_CAMERA.position, fov: 45 }}
      onPointerMissed={() => setActivePiece(null)}
      dpr={[1, 2]}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#07070d"]} />
      <fog attach="fog" args={["#07070d", 55, 130]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 18, 8]} intensity={1} />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#f7931a" />
      {/* rim lights along the arc for depth */}
      <pointLight position={[-16, 5, 8]} intensity={0.5} color="#f7931a" />
      <pointLight position={[16, 5, 8]} intensity={0.5} color="#f7931a" />
      <pointLight position={[0, 6, -18]} intensity={0.45} color="#5fd4ff" />

      {/* reflective machine-shop floor */}
      <mesh position={[0, -2.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial
          blur={[280, 60]}
          resolution={1024}
          mixBlur={0.9}
          mixStrength={12}
          roughness={0.92}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#08080e"
          metalness={0.55}
          mirror={0.55}
        />
      </mesh>
      <Grid
        position={[0, -2.01, 0]}
        args={[80, 80]}
        cellColor="#12121c"
        sectionColor="#1f1f2e"
        fadeDistance={70}
        infiniteGrid
      />
      <ContactShadows position={[0, -1.99, 0]} opacity={0.55} scale={60} blur={2.2} far={12} />

      <NetworkGlobe />
      <MachineFrame />
      <WattAvatar />

      {PIECES.map((p) => {
        const Visual = PIECE_VISUALS[p.id];
        return (
          <PieceShell key={p.id} piece={p}>
            {Visual ? <Visual active={activePiece === p.id} /> : null}
          </PieceShell>
        );
      })}

      <CameraRig />
      <MachineEffects />
    </Canvas>
  );
}
