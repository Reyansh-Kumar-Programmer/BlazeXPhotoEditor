"use client";

import React from "react";
import { TopBar } from "./TopBar";
import { LibrarySidebar } from "./LibrarySidebar";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { RightPanel } from "./RightPanel";
import { StatusBar } from "./StatusBar";
import { useEditorStore } from "@/stores/editorStore";

export function EditorShell() {
  const theme = useEditorStore((s) => s.theme);

  return (
    <div
      data-theme={theme}
      className="h-screen w-full flex flex-col overflow-hidden select-none font-sans transition-colors duration-200"
      style={{
        backgroundColor: "var(--editor-bg)",
        color: "var(--editor-fg)",
      }}
    >
      <TopBar />

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        <LibrarySidebar />
        <CanvasWorkspace />
        <RightPanel />
      </div>

      <StatusBar />
    </div>
  );
}
