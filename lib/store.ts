import { create } from "zustand";

interface MachineState {
  /** active piece id, or null for the overview camera */
  activePiece: string | null;
  setActivePiece: (id: string | null) => void;
  /** true while Watt's narration or answer audio is playing */
  isSpeaking: boolean;
  setSpeaking: (v: boolean) => void;
}

export const useMachineStore = create<MachineState>((set) => ({
  activePiece: null,
  setActivePiece: (id) => set({ activePiece: id }),
  isSpeaking: false,
  setSpeaking: (v) => set({ isSpeaking: v }),
}));
