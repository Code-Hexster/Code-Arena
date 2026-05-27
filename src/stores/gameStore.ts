import { create } from "zustand";
import type { Profile, Mission, MissionCompletion } from "@/types/database";

interface GameState {
  // Player
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  updateXp: (newXp: number, newLevel: number) => void;

  // Current mission
  currentMission: Mission | null;
  setCurrentMission: (mission: Mission | null) => void;

  // Editor
  editorCode: string;
  setEditorCode: (code: string) => void;

  // Execution
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  output: string;
  setOutput: (output: string) => void;

  // Completions (cached for current session)
  completions: Record<string, MissionCompletion>;
  addCompletion: (missionId: string, completion: MissionCompletion) => void;

  // UI state
  hintsUsed: number;
  incrementHints: () => void;
  resetHints: () => void;
  wizardOpen: boolean;
  setWizardOpen: (open: boolean) => void;

  // XP popup
  xpPopup: { amount: number; visible: boolean };
  showXpPopup: (amount: number) => void;
  hideXpPopup: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Player
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateXp: (newXp, newLevel) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, total_xp: newXp, level: newLevel }
        : null,
    })),

  // Current mission
  currentMission: null,
  setCurrentMission: (mission) =>
    set({ currentMission: mission, editorCode: mission?.starter_code || "", hintsUsed: 0, output: "" }),

  // Editor
  editorCode: "",
  setEditorCode: (code) => set({ editorCode: code }),

  // Execution
  isRunning: false,
  setIsRunning: (running) => set({ isRunning: running }),
  output: "",
  setOutput: (output) => set({ output }),

  // Completions
  completions: {},
  addCompletion: (missionId, completion) =>
    set((state) => ({
      completions: { ...state.completions, [missionId]: completion },
    })),

  // UI state
  hintsUsed: 0,
  incrementHints: () => set((state) => ({ hintsUsed: state.hintsUsed + 1 })),
  resetHints: () => set({ hintsUsed: 0 }),
  wizardOpen: false,
  setWizardOpen: (open) => set({ wizardOpen: open }),

  // XP popup
  xpPopup: { amount: 0, visible: false },
  showXpPopup: (amount) => set({ xpPopup: { amount, visible: true } }),
  hideXpPopup: () => set({ xpPopup: { amount: 0, visible: false } }),
}));
