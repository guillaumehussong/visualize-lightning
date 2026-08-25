"use client";

import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { DEFAULT_CAMERA, PIECES } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";
import { CameraRig } from "./CameraRig";
import { PieceBox } from "./PieceBox";

/**
 * The machine canvas. Phase 2: placeholder pieces on an arc, bedrock slab for
 * Settlement, click empty space to return to the overview.
 */
export default function MachineCanvas() {
  const setActivePiece = useMachineStore((s) => s.setActivePiece);

  return (
    <Canvas
      camera={{ position: DEFAULT_CAMERA.position, fov: 45 }}
      onPointerMissed={() => setActivePiece(null)}
      dpr={[1, 2]}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#07070d"]} />
      <fog attach="fog" args={["#07070d", 40, 90]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 18, 8]} intensity={1.1} />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#f7931a" />

      <Grid
        position={[0, -2.02, 0]}
        args={[80, 80]}
        cellColor="#1a1a26"
        sectionColor="#2a2a3a"
        fadeDistance={70}
        infiniteGrid
      />

      {PIECES.map((p) => (
        <PieceBox key={p.id} piece={p} />
      ))}

      <CameraRig />
    </Canvas>
  );
}
