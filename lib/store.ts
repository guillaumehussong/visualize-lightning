import { create } from "zustand";

interface MachineState {
  /** active piece id, or null for the overview camera */
  activePiece: string | null;
  setActivePiece: (id: string | null) => void;
}

export const useMachineStore = create<MachineState>((set) => ({
  activePiece: null,
  setActivePiece: (id) => set({ activePiece: id }),
}));
