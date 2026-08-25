"use client";

import dynamic from "next/dynamic";

const MachineCanvas = dynamic(() => import("./MachineCanvas"), { ssr: false });

export function MachineCanvasClient() {
  return <MachineCanvas />;
}
