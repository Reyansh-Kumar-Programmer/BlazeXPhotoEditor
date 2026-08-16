"use client";

import React from "react";
import {
  Minus,
  Plus,
  Maximize2,
  Expand,
  SplitSquareVertical,
} from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";

export function CanvasToolbar() {
  const image = useEditorStore((s) => s.image);
  const zoom = useEditorStore((s) => s.zoom);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const resetZoom = useEditorStore((s) => s.resetZoom);
  const resetPan = useEditorStore((s) => s.resetPan);
  const isBeforeAfter = useEditorStore((s) => s.isBeforeAfter);
  const toggleBeforeAfter = useEditorStore((s) => s.toggleBeforeAfter);
  const theme = useEditorStore((s) => s.theme);

  const isDark = theme === "dark";
  const isDisabled = !image.isLoaded;

  const handleFit = () => {
    resetZoom();
    resetPan();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      className={`absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 backdrop-blur rounded-full px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 select-none z-20 transition-all ${
        isDisabled ? "opacity-40 pointer-events-none" : ""
      }`}
      style={{
        backgroundColor: isDark ? "rgba(20,21,25,0.92)" : "rgba(255,255,255,0.94)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
        boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
        color: isDark ? "#e5e5e5" : "#262626",
      }}
    >
      <button
        type="button"
        onClick={zoomOut}
        disabled={isDisabled || zoom <= 25}
        title="Zoom Out"
        className="p-1 rounded-full transition-colors disabled:opacity-30"
      >
        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={handleFit}
        disabled={isDisabled}
        title="Reset Zoom"
        className="font-mono text-[11px] sm:text-xs font-semibold min-w-[36px] text-center px-1 py-0.5 rounded transition-colors"
      >
        {zoom}%
      </button>

      <button
        type="button"
        onClick={zoomIn}
        disabled={isDisabled || zoom >= 400}
        title="Zoom In"
        className="p-1 rounded-full transition-colors disabled:opacity-30"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      <div className="h-3.5 w-px mx-0.5" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }} />

      <button
        type="button"
        onClick={handleFit}
        disabled={isDisabled}
        title="Fit"
        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors"
      >
        <Maximize2 className="w-3 h-3 stroke-[2.2]" />
        <span className="hidden sm:inline">Fit</span>
      </button>

      <button
        type="button"
        onClick={toggleFullscreen}
        title="Fullscreen"
        className="p-1 rounded-full transition-colors"
      >
        <Expand className="w-3.5 h-3.5 stroke-[2]" />
      </button>

      <div className="h-3.5 w-px mx-0.5" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }} />

      <button
        type="button"
        onClick={toggleBeforeAfter}
        disabled={isDisabled}
        title="Before/After (Y)"
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors"
        style={{
          backgroundColor: isBeforeAfter ? "var(--editor-active)" : "transparent",
          color: isBeforeAfter ? "var(--editor-active-fg)" : "inherit",
        }}
      >
        <SplitSquareVertical className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">B / A</span>
      </button>
    </div>
  );
}
