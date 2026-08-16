"use client";

import React, { useRef, useState } from "react";
import { Sparkles, Upload, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { CanvasToolbar } from "./CanvasToolbar";
import { EditorCanvas } from "./EditorCanvas";
import { DesignToolbar } from "./DesignToolbar";
import { DesignCanvas } from "./DesignCanvas";
import { useEditorStore } from "@/stores/editorStore";

export function CanvasWorkspace() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    image,
    mode,
    isBeforeAfter,
    setImageFile,
    setImageError,
    theme,
  } = useEditorStore();

  const isDark = theme === "dark";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await setImageFile(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await setImageFile(files[0]);
    }
  };

  return (
    <main
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 h-full studio-grid-bg flex flex-col items-center justify-between overflow-hidden select-none"
      style={{ backgroundColor: "var(--editor-canvas)" }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Top Design Toolbar in Design Mode */}
      {mode === "design" && <DesignToolbar />}

      {/* Drag Overlay */}
      {isDragOver && (
        <div
          className="absolute inset-3 z-50 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 animate-fade-in"
          style={{
            backgroundColor: isDark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.8)",
            border: `2px dashed ${isDark ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)"}`,
            color: "#fff",
          }}
        >
          <Upload className="w-10 h-10 stroke-[1.5] animate-bounce" />
          <h3 className="text-sm font-bold tracking-tight">Drop photo to import</h3>
          <p className="text-[11px] text-neutral-300">JPG, PNG, WEBP</p>
        </div>
      )}

      {/* Before / After Badge */}
      {image.isLoaded && isBeforeAfter && mode === "develop" && (
        <div
          className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold shadow-md"
          style={{
            backgroundColor: "var(--editor-active)",
            color: "var(--editor-active-fg)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Before / After (Y)</span>
        </div>
      )}

      {/* Error Toast */}
      {image.error && (
        <div
          className="absolute top-3 right-3 z-30 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shadow-xl max-w-xs animate-fade-in"
          style={{
            backgroundColor: isDark ? "#1c1d24" : "#18181b",
            color: "#fff",
            border: `1px solid ${isDark ? "#2a2b35" : "#262626"}`,
          }}
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="flex-1 text-[11px]">{image.error}</span>
          <button type="button" onClick={() => setImageError(null)} className="text-neutral-400 hover:text-white ml-1">✕</button>
        </div>
      )}

      {/* Loading Indicator */}
      {image.isLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)" }}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--editor-active)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--editor-fg)" }}>Loading image...</span>
          </div>
        </div>
      )}

      {/* Viewport Content */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        {mode === "design" ? (
          <DesignCanvas />
        ) : image.isLoaded ? (
          <EditorCanvas />
        ) : (
          <div
            className="relative w-[90%] max-w-lg sm:max-w-xl h-[70%] max-h-[500px] rounded-lg flex flex-col items-center justify-center p-6 sm:p-8 transition-all"
            style={{
              backgroundColor: "var(--editor-panel)",
              border: `1px solid var(--editor-border)`,
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            {/* Dashed inner border */}
            <div
              className="absolute inset-3 rounded pointer-events-none"
              style={{ border: `1px dashed ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}
            />

            <div className="relative z-10 flex flex-col items-center text-center gap-4 sm:gap-5">
              <div className="relative">
                <div
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: "var(--editor-active)", color: "var(--editor-active-fg)" }}
                >
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.8]" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center shadow"
                  style={{
                    backgroundColor: "var(--editor-panel)",
                    border: `1px solid var(--editor-border)`,
                    color: "var(--editor-muted)",
                  }}
                >
                  <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: "var(--editor-fg)" }}>
                  No photo open
                </h2>
                <p className="text-[11px] sm:text-xs max-w-xs leading-relaxed" style={{ color: "var(--editor-muted)" }}>
                  Import an image or drag & drop to start editing.
                </p>
              </div>

              <button
                type="button"
                onClick={triggerImport}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-md text-xs font-semibold transition-all shadow-md active:scale-[0.98]"
                style={{ backgroundColor: "var(--editor-active)", color: "var(--editor-active-fg)" }}
              >
                <Upload className="w-4 h-4 stroke-[2.2]" />
                <span>Import Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CanvasToolbar />
    </main>
  );
}
