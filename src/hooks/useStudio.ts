import { useStudioStore } from "@/stores/useStudioStore";
import { StudioViewMode } from "@/types";

export function useStudio() {
  const config = useStudioStore((state) => state.config);
  const setMode = useStudioStore((state) => state.setMode);
  const setEngineStatus = useStudioStore((state) => state.setEngineStatus);
  const resetStudio = useStudioStore((state) => state.resetStudio);

  const openEditor = () => {
    setMode("editor");
  };

  const returnToLanding = () => {
    setMode("landing");
  };

  return {
    config,
    activeMode: config.activeMode,
    isReady: config.engineStatus === "ready",
    setMode,
    setEngineStatus,
    resetStudio,
    openEditor,
    returnToLanding,
  };
}
