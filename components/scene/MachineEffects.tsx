"use client";

import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Neon bloom, desktop only (mobile GPUs stay clean, SwiftShader QA stays
 * stable). Disabled for reduced-motion users. */
export function MachineEffects() {
  const size = useThree((s) => s.size);
  const reducedMotion = useReducedMotion();
  if (size.width < 768 || reducedMotion) return null;
  return (
    <EffectComposer>
      <Bloom
        mipmapBlur
        intensity={0.75}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.25}
      />
    </EffectComposer>
  );
}
