"use client";

import React, { useState, useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { CropRatioPreset } from "@/types/design";
import { Check, X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RefreshCw } from "lucide-react";

export const CROP_RATIOS: { label: string; value: CropRatioPreset; ratio?: number }[] = [
  { label: "Free", value: "Free" },
  { label: "Original", value: "Original" },
  { label: "1:1 Square", value: "1:1", ratio: 1 },
  { label: "4:5 Portrait", value: "4:5", ratio: 4 / 5 },
  { label: "3:2 Classic", value: "3:2", ratio: 3 / 2 },
  { label: "4:3 Standard", value: "4:3", ratio: 4 / 3 },
  { label: "16:9 Widescreen", value: "16:9", ratio: 16 / 9 },
  { label: "9:16 Story", value: "9:16", ratio: 9 / 16 },
  { label: "2:3 Portrait", value: "2:3", ratio: 2 / 3 },
];

export function CropOverlay() {
  const documentPreset = useEditorStore((s) => s.documentPreset);
  const cropState = useEditorStore((s) => s.cropState);
  const setCropState = useEditorStore((s) => s.setCropState);
  const applyCrop = useEditorStore((s) => s.applyCrop);
  const cancelCrop = useEditorStore((s) => s.cancelCrop);
  const rotateActive = useEditorStore((s) => s.rotateActive);
  const flipActive = useEditorStore((s) => s.flipActive);

  const docW = documentPreset.width;
  const docH = documentPreset.height;

  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; crop: typeof cropState } | null>(null);

  const cropX = cropState.x;
  const cropY = cropState.y;
  const cropW = cropState.width;
  const cropH = cropState.height;

  const handleRatioChange = (preset: CropRatioPreset) => {
    let newW = cropW;
    let newH = cropH;

    const matched = CROP_RATIOS.find((r) => r.value === preset);
    if (matched && matched.ratio) {
      const targetRatio = matched.ratio;
      newH = cropW / targetRatio;
      if (newH > docH) {
        newH = docH;
        newW = docH * targetRatio;
      }
    } else if (preset === "Original") {
      newW = docW;
      newH = docH;
    }

    setCropState({
      aspectRatio: preset,
      width: Math.min(docW, Math.round(newW)),
      height: Math.min(docH, Math.round(newH)),
      x: Math.max(0, Math.min(docW - newW, cropX)),
      y: Math.max(0, Math.min(docH - newH, cropY)),
    });
  };

  const handlePointerDown = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDragHandle(handle);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      crop: { ...cropState },
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragHandle || !dragStart) return;

    const dx = e.clientX - dragStart.mouseX;
    const dy = e.clientY - dragStart.mouseY;

    const init = dragStart.crop;
    let newX = init.x;
    let newY = init.y;
    let newW = init.width;
    let newH = init.height;

    const matchedRatio = CROP_RATIOS.find((r) => r.value === cropState.aspectRatio)?.ratio;

    if (dragHandle === "move") {
      newX = Math.max(0, Math.min(docW - init.width, init.x + dx));
      newY = Math.max(0, Math.min(docH - init.height, init.y + dy));
    } else {
      if (dragHandle.includes("e")) newW = Math.max(50, Math.min(docW - init.x, init.width + dx));
      if (dragHandle.includes("s")) newH = Math.max(50, Math.min(docH - init.y, init.height + dy));

      if (dragHandle.includes("w")) {
        const w = Math.max(50, init.width - dx);
        newX = Math.max(0, init.x + (init.width - w));
        newW = init.width + (init.x - newX);
      }
      if (dragHandle.includes("n")) {
        const h = Math.max(50, init.height - dy);
        newY = Math.max(0, init.y + (init.height - h));
        newH = init.height + (init.y - newY);
      }

      // Enforce aspect ratio lock if selected
      if (matchedRatio) {
        newH = newW / matchedRatio;
        if (newY + newH > docH) {
          newH = docH - newY;
          newW = newH * matchedRatio;
        }
      }
    }

    setCropState({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH),
    });
  };

  const handlePointerUp = () => {
    setDragHandle(null);
    setDragStart(null);
  };

  return (
    <div
      className="absolute inset-0 z-40 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Dim Outside Crop Box (4 rectangles) */}
      {/* Top */}
      <div
        className="absolute bg-black/65 pointer-events-none"
        style={{ left: 0, top: 0, width: `${docW}px`, height: `${cropY}px` }}
      />
      {/* Bottom */}
      <div
        className="absolute bg-black/65 pointer-events-none"
        style={{
          left: 0,
          top: `${cropY + cropH}px`,
          width: `${docW}px`,
          height: `${Math.max(0, docH - (cropY + cropH))}px`,
        }}
      />
      {/* Left */}
      <div
        className="absolute bg-black/65 pointer-events-none"
        style={{ left: 0, top: `${cropY}px`, width: `${cropX}px`, height: `${cropH}px` }}
      />
      {/* Right */}
      <div
        className="absolute bg-black/65 pointer-events-none"
        style={{
          left: `${cropX + cropW}px`,
          top: `${cropY}px`,
          width: `${Math.max(0, docW - (cropX + cropW))}px`,
          height: `${cropH}px`,
        }}
      />

      {/* Active Crop Box Window */}
      <div
        className="absolute border-2 border-white shadow-2xl cursor-move flex flex-col justify-between"
        style={{
          left: `${cropX}px`,
          top: `${cropY}px`,
          width: `${cropW}px`,
          height: `${cropH}px`,
          transform: `rotate(${cropState.rotation}deg)`,
        }}
        onPointerDown={(e) => handlePointerDown("move", e)}
      >
        {/* Rule-of-Thirds Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-white/20" />
          <div className="border-r border-white/20" />
          <div />
        </div>

        {/* Dimension Readout Badge */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
          {cropW} × {cropH} px
        </div>

        {/* Handles */}
        {/* Corner Handles */}
        <div
          className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-slate-500 rounded-sm cursor-nwse-resize shadow"
          onPointerDown={(e) => handlePointerDown("nw", e)}
        />
        <div
          className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-slate-500 rounded-sm cursor-nesw-resize shadow"
          onPointerDown={(e) => handlePointerDown("ne", e)}
        />
        <div
          className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-slate-500 rounded-sm cursor-nesw-resize shadow"
          onPointerDown={(e) => handlePointerDown("sw", e)}
        />
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-slate-500 rounded-sm cursor-nwse-resize shadow"
          onPointerDown={(e) => handlePointerDown("se", e)}
        />

        {/* Edge Handles */}
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-ns-resize shadow"
          onPointerDown={(e) => handlePointerDown("n", e)}
        />
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-ns-resize shadow"
          onPointerDown={(e) => handlePointerDown("s", e)}
        />
        <div
          className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 bg-white border-2 border-slate-500 rounded-sm cursor-ew-resize shadow"
          onPointerDown={(e) => handlePointerDown("w", e)}
        />
        <div
          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 bg-white border-2 border-slate-500 rounded-sm cursor-ew-resize shadow"
          onPointerDown={(e) => handlePointerDown("e", e)}
        />
      </div>

      {/* Floating Crop Control Toolbar Bar at Bottom */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/95 text-slate-100 border border-slate-700/80 rounded-lg p-2 shadow-2xl flex items-center gap-3 z-50 pointer-events-auto backdrop-blur-md">
        {/* Ratios Dropdown */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Ratio:</span>
          <select
            value={cropState.aspectRatio}
            onChange={(e) => handleRatioChange(e.target.value as CropRatioPreset)}
            className="bg-slate-800 text-xs text-white border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-slate-500"
          >
            {CROP_RATIOS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-px h-5 bg-slate-700" />

        {/* Straighten Rotation Slider */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Angle:</span>
          <input
            type="range"
            min={-45}
            max={45}
            value={cropState.rotation}
            onChange={(e) => setCropState({ rotation: Number(e.target.value) })}
            className="w-20 accent-slate-400 cursor-pointer"
          />
          <span className="text-[10px] font-mono w-7 text-right">{cropState.rotation}°</span>
          <button
            type="button"
            onClick={() => setCropState({ rotation: 0 })}
            title="Reset Straighten Angle"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-700" />

        {/* Quick Flip & Rotate */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => rotateActive("left")}
            title="Rotate Left 90°"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => rotateActive("right")}
            title="Rotate Right 90°"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => flipActive("horizontal")}
            title="Flip Horizontal"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => flipActive("vertical")}
            title="Flip Vertical"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-700" />

        {/* Apply & Cancel */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={cancelCrop}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={applyCrop}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded font-semibold flex items-center gap-1 shadow transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
