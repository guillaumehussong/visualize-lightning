"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { DEFAULT_CAMERA, PIECES, pieceCamera } from "@/lib/pieces";
import { useMachineStore } from "@/lib/store";

/**
 * Flies the camera to the active piece (or back to the overview) with damped
 * interpolation, then leaves OrbitControls free for the user.
 */
export function CameraRig() {
  const activePiece = useMachineStore((s) => s.activePiece);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const goal = useRef({
    position: new THREE.Vector3(...DEFAULT_CAMERA.position),
    target: new THREE.Vector3(...DEFAULT_CAMERA.target),
  });

  const piece = PIECES.find((p) => p.id === activePiece) ?? null;
  const cam = piece ? pieceCamera(piece) : DEFAULT_CAMERA;
  goal.current.position.set(...cam.position);
  goal.current.target.set(...cam.target);

  useFrame((_, delta) => {
    const lambda = 3.5;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, goal.current.position.x, lambda, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, goal.current.position.y, lambda, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, goal.current.position.z, lambda, delta);
    if (controls) {
      controls.target.x = THREE.MathUtils.damp(controls.target.x, goal.current.target.x, lambda, delta);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, goal.current.target.y, lambda, delta);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, goal.current.target.z, lambda, delta);
      controls.update();
    } else {
      camera.lookAt(goal.current.target);
    }
  });

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      minDistance={6}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
}
