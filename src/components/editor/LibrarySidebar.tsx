"use client";

import React, { useRef, useState } from "react";
import {
  FolderOpen,
  Image as ImageIcon,
  Heart,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Upload,
  Check,
  X,
} from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";

export function LibrarySidebar() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    image,
    isLibraryOpen,
    toggleLibrary,
    setImageFile,
    clearImage,
    theme,
  } = useEditorStore();

  const isDark = theme === "dark";
  const [activeFilter, setActiveFilter] = useState<"all" | "favorites">("all");

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

  if (!isLibraryOpen) {
    return (
      <div
        className="h-full flex flex-col items-center py-3 px-1 select-none z-20 shrink-0 transition-colors duration-200"
        style={{
          backgroundColor: "var(--editor-panel)",
          borderRight: "1px solid var(--editor-border)",
        }}
      >
        <button
          type="button"
          onClick={toggleLibrary}
          title="Open Library"
          className="p-1.5 rounded-md transition-colors"
          style={{ color: "var(--editor-muted)" }}
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="w-48 sm:w-56 lg:w-60 h-full flex flex-col justify-between select-none z-20 shrink-0 transition-all duration-200"
      style={{
        backgroundColor: "var(--editor-panel)",
        borderRight: "1px solid var(--editor-border)",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col">
        {/* Header */}
        <div
          className="h-9 px-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--editor-border-subtle)" }}
        >
          <span
            className="text-[10px] font-bold tracking-widest font-mono uppercase"
            style={{ color: "var(--editor-muted)" }}
          >
            Library
          </span>
          <button
            type="button"
            onClick={toggleLibrary}
            title="Collapse"
            className="p-1 rounded transition-colors"
            style={{ color: "var(--editor-muted)" }}
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-2 space-y-1" style={{ borderBottom: "1px solid var(--editor-border-subtle)" }}>
          <button
            type="button"
            onClick={triggerImport}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold shadow-sm transition-colors"
            style={{
              backgroundColor: "var(--editor-active)",
              color: "var(--editor-active-fg)",
            }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Import Photo</span>
          </button>

          {(["all", "favorites"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: activeFilter === f
                  ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)")
                  : "transparent",
                color: activeFilter === f ? "var(--editor-fg)" : "var(--editor-muted)",
              }}
            >
              <div className="flex items-center gap-2">
                {f === "all" ? (
                  <ImageIcon className="w-3.5 h-3.5" />
                ) : (
                  <Heart className="w-3.5 h-3.5" />
                )}
                <span>{f === "all" ? "All Photos" : "Favorites"}</span>
              </div>
              <span className="font-mono text-[10px]" style={{ color: "var(--editor-muted)" }}>
                {f === "all" && image.isLoaded ? 1 : 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex-1 p-2 overflow-y-auto">
        {image.isLoaded && image.thumbnailUrl ? (
          <div className="space-y-2 animate-fade-in">
            <span
              className="text-[9px] font-mono font-bold uppercase tracking-widest px-1"
              style={{ color: "var(--editor-muted)" }}
            >
              Active
            </span>

            <div
              className="group relative rounded-md overflow-hidden shadow-sm transition-all"
              style={{
                border: `2px solid var(--editor-active)`,
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
              }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: isDark ? "#1a1b20" : "#f0f0f0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.thumbnailUrl}
                  alt={image.file?.name || "Photo"}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute top-1 right-1 p-0.5 rounded-full shadow"
                  style={{ backgroundColor: "var(--editor-active)", color: "var(--editor-active-fg)" }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <p className="text-[11px] font-semibold truncate" style={{ color: "var(--editor-fg)" }}>
                  {image.file?.name || "Photo"}
                </p>
                <div className="flex items-center justify-between font-mono text-[9px]" style={{ color: "var(--editor-muted)" }}>
                  <span>{image.width}×{image.height}</span>
                  <span>{image.file ? (image.file.size / (1024 * 1024)).toFixed(1) + "MB" : ""}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={clearImage}
                title="Remove photo"
                className="absolute top-1 left-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.6)",
                  color: "#fff",
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center gap-3 max-w-[160px]">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                  color: "var(--editor-muted)",
                }}
              >
                <FolderOpen className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-semibold" style={{ color: "var(--editor-fg)" }}>
                  No photos yet
                </h4>
                <p className="text-[10px] leading-normal" style={{ color: "var(--editor-muted)" }}>
                  Import a photo to begin editing.
                </p>
              </div>
              <button
                type="button"
                onClick={triggerImport}
                className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  color: "var(--editor-fg)",
                  border: `1px solid var(--editor-border)`,
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="p-2 text-center text-[9px] font-mono"
        style={{ borderTop: "1px solid var(--editor-border-subtle)", color: "var(--editor-muted)" }}
      >
        PixelRaw Library
      </div>
    </aside>
  );
}
