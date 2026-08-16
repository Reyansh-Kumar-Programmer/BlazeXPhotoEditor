import { create } from "zustand";
import { StudioConfig, StudioViewMode, SystemStatus } from "@/types";

interface StudioState {
  config: StudioConfig;
  setMode: (mode: StudioViewMode) => void;
  setEngineStatus: (status: SystemStatus) => void;
  resetStudio: () => void;
}

const INITIAL_CONFIG: StudioConfig = {
  appName: "PixelRaw",
  version: "0.1.0",
  tagline: "A modern professional photo development and editing studio.",
  activeMode: "editor",
  engineStatus: "ready",
};

export const useStudioStore = create<StudioState>((set) => ({
  config: INITIAL_CONFIG,

  setMode: (mode: StudioViewMode) =>
    set((state) => ({
      config: { ...state.config, activeMode: mode },
    })),

  setEngineStatus: (status: SystemStatus) =>
    set((state) => ({
      config: { ...state.config, engineStatus: status },
    })),

  resetStudio: () =>
    set({
      config: INITIAL_CONFIG,
    }),
}));
