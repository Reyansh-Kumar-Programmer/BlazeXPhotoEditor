"use client";

import React from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";

export function StatusBar() {
  const image = useEditorStore((s) => s.image);
  const zoom = useEditorStore((s) => s.zoom);
  const isBeforeAfter = useEditorStore((s) => s.isBeforeAfter);
  const isProcessing = useEditorStore((s) => s.isProcessing);
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <footer
      className="h-6 w-full px-3 flex items-center justify-between text-[10px] font-mono select-none z-30 shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: "var(--editor-panel)",
        borderTop: "1px solid var(--editor-border)",
        color: "var(--editor-muted)",
      }}
    >
      <div className="flex items-center gap-3">
        {isProcessing || image.isLoading ? (
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--editor-fg)" }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--editor-fg)" }}>
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </span>
        )}

        <span style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }}>|</span>
        <span>RGB</span>
        <span style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }}>|</span>

        {image.isLoaded ? (
          <span style={{ color: "var(--editor-fg)" }} className="font-semibold">
            {image.width} × {image.height}
          </span>
        ) : (
          <span>No Image</span>
        )}

        <span style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }}>|</span>
        <span>{isBeforeAfter ? "Original" : "Edited"}</span>
        <span style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }}>|</span>
        <span style={{ color: "var(--editor-fg)" }} className="font-semibold">{zoom}%</span>
      </div>

      <div className="hidden sm:flex items-center gap-1 text-[9px]">
        <ShieldCheck className="w-2.5 h-2.5" />
        <span>PixelRaw v0.1.0</span>
      </div>
    </footer>
  );
}
