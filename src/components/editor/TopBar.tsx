"use client";

import React from "react";
import {
  Sparkles,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  SlidersHorizontal,
  LayoutGrid,
  SplitSquareVertical,
  Moon,
  Sun,
  Plus,
} from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { EditorSection } from "@/types/editor";
import { NewProjectModal } from "./NewProjectModal";
import { ExportModal } from "./ExportModal";

export function TopBar() {
  const [isNewProjectOpen, setIsNewProjectOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const {
    activeSection,
    setActiveSection,
    mode,
    setMode,
    resetAllAdjustments,
    undo,
    redo,
    historyIndex,
    history,
    theme,
    toggleTheme,
    image,
  } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const isDark = theme === "dark";

  const navItems: { id: EditorSection; label: string; icon: React.ElementType }[] = [
    { id: "library", label: "Library", icon: LayoutGrid },
    { id: "develop", label: "Develop", icon: SlidersHorizontal },
    { id: "compare", label: "Compare", icon: SplitSquareVertical },
  ];

  return (
    <header
      className="h-11 w-full px-2 sm:px-4 flex items-center justify-between select-none z-30 shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: "var(--editor-panel)",
        borderBottom: "1px solid var(--editor-border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 sm:min-w-[140px]">
        <div
          className="h-6 w-6 rounded flex items-center justify-center shrink-0 shadow-sm"
          style={{
            backgroundColor: "var(--editor-active)",
            color: "var(--editor-active-fg)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
        <span className="font-mono text-sm tracking-tight font-extrabold hidden sm:flex items-center gap-0.5">
          Pixel<span className="font-normal" style={{ color: "var(--editor-muted)" }}>Raw</span>
        </span>
      </div>

      {/* Center Nav: DEVELOP vs DESIGN Mode Switcher */}
      <nav
        className="flex items-center gap-0.5 p-0.5 rounded-lg transition-colors"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        }}
      >
        <button
          type="button"
          onClick={() => setMode("develop")}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all"
          style={{
            backgroundColor: mode === "develop" ? "var(--editor-active)" : "transparent",
            color: mode === "develop" ? "var(--editor-active-fg)" : "var(--editor-muted)",
            boxShadow: mode === "develop" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Develop</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("design")}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all"
          style={{
            backgroundColor: mode === "design" ? "var(--editor-active)" : "transparent",
            color: mode === "design" ? "var(--editor-active-fg)" : "var(--editor-muted)",
            boxShadow: mode === "design" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
          }}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Design</span>
        </button>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 min-w-0 sm:min-w-[140px] justify-end">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-md transition-colors disabled:opacity-30"
          style={{ color: canUndo ? "var(--editor-fg)" : "var(--editor-muted)" }}
        >
          <Undo2 className="w-4 h-4 stroke-[2]" />
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="p-1.5 rounded-md transition-colors disabled:opacity-30"
          style={{ color: canRedo ? "var(--editor-fg)" : "var(--editor-muted)" }}
        >
          <Redo2 className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="h-4 w-px mx-0.5 hidden sm:block" style={{ backgroundColor: "var(--editor-border)" }} />

        <button
          type="button"
          onClick={() => setIsNewProjectOpen(true)}
          title="New Canvas / Document"
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border transition-colors"
          style={{
            borderColor: "var(--editor-border)",
            color: "var(--editor-fg)",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">New</span>
        </button>

        <button
          type="button"
          onClick={resetAllAdjustments}
          title="Reset All"
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors"
          style={{ color: "var(--editor-muted)" }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          disabled={!image.isLoaded && mode !== "design"}
          title="Export Design or Edited Image"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold shadow-sm transition-colors disabled:opacity-40"
          style={{
            backgroundColor: "var(--editor-active)",
            color: "var(--editor-active-fg)",
          }}
        >
          <Download className="w-3.5 h-3.5 stroke-[2.2]" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </header>
  );
}
