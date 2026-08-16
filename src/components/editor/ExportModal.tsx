"use client";

import React, { useState, useEffect } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { exportDesignCanvas, exportDevelopPhoto } from "@/lib/image/exportEngine";
import { Download, X, CheckCircle2 } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const mode = useEditorStore((s) => s.mode);
  const image = useEditorStore((s) => s.image);
  const objects = useEditorStore((s) => s.objects);
  const documentPreset = useEditorStore((s) => s.documentPreset);
  const documentBackground = useEditorStore((s) => s.documentBackground);
  const adjustments = useEditorStore((s) => s.adjustments);

  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState<number>(0.92);
  const [filename, setFilename] = useState<string>(mode === "develop" ? "PixelRaw_Photo" : "PixelRaw_Design");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    setFilename(mode === "develop" ? "PixelRaw_Photo" : "PixelRaw_Design");
  }, [mode]);

  if (!isOpen) return null;

  const isDevelopMode = mode === "develop";
  const exportWidth = isDevelopMode ? (image.width || 1920) : documentPreset.width;
  const exportHeight = isDevelopMode ? (image.height || 1080) : documentPreset.height;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (isDevelopMode && image.imageUrl) {
        await exportDevelopPhoto(image.imageUrl, adjustments, {
          format,
          quality,
          filename: `${filename}.${format}`,
        });
      } else {
        await exportDesignCanvas(objects, documentPreset, documentBackground, adjustments, {
          format,
          quality,
          filename: `${filename}.${format}`,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div
        className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all"
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b border-zinc-800 bg-black/60 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/60">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isDevelopMode ? "Export Photo (Develop Mode)" : "Export Design Canvas (Design Mode)"}
              </h2>
              <p className="text-[10px] font-mono text-zinc-400">
                {isDevelopMode ? "Exporting Lightroom-adjusted single photo" : "Exporting multi-layer design document"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Output Dimensions Info */}
          <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Export Dimensions</span>
              <span className="font-mono text-sm font-bold text-zinc-100">
                {exportWidth} × {exportHeight} px
              </span>
            </div>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60 px-2 py-0.5 rounded">
              {isDevelopMode ? "Native Resolution" : documentPreset.name}
            </span>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
              File Format:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["png", "jpeg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-2 rounded-lg border text-center font-mono uppercase text-xs font-semibold transition-all ${
                    format === fmt
                      ? "bg-zinc-800 border-zinc-400 text-white shadow-md ring-1 ring-zinc-400"
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG & WebP) */}
          {format !== "png" && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-zinc-300 text-[11px]">
                <span className="font-mono text-zinc-400">Export Quality:</span>
                <span className="font-mono text-zinc-100 font-bold">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-zinc-200 cursor-pointer"
              />
            </div>
          )}

          {/* Filename Input */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
              File Name:
            </label>
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden px-2.5 py-1.5 focus-within:border-zinc-500">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] font-mono text-zinc-500 uppercase ml-1">.{format}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3.5 border-t border-zinc-800 bg-black/60 flex items-center justify-between"
        >
          <span className="text-[10px] font-mono text-zinc-400">
            {isDevelopMode ? "Source: Single Photo" : `Total Layers: ${objects.length}`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded-lg font-medium border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || (isDevelopMode && !image.imageUrl)}
              className="px-5 py-1.5 bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 text-xs rounded-lg font-bold flex items-center gap-1.5 shadow-lg transition-colors"
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Exported!
                </>
              ) : isExporting ? (
                <>Processing...</>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
