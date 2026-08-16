"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { DOCUMENT_PRESETS, DocumentPreset } from "@/types/design";
import { Layout, Grid, Eye, Ruler, Shield, Layers, Plus, Trash2 } from "lucide-react";

export function DocumentProperties() {
  const documentPreset = useEditorStore((s) => s.documentPreset);
  const documentBackground = useEditorStore((s) => s.documentBackground);
  const grid = useEditorStore((s) => s.grid);
  const smartGuides = useEditorStore((s) => s.smartGuides);
  const showRulers = useEditorStore((s) => s.showRulers);
  const showSafeArea = useEditorStore((s) => s.showSafeArea);
  const guides = useEditorStore((s) => s.guides);

  const setDocumentPreset = useEditorStore((s) => s.setDocumentPreset);
  const setCustomDocumentSize = useEditorStore((s) => s.setCustomDocumentSize);
  const setDocumentBackground = useEditorStore((s) => s.setDocumentBackground);
  const setGridSettings = useEditorStore((s) => s.setGridSettings);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const setSmartGuides = useEditorStore((s) => s.setSmartGuides);
  const toggleRulers = useEditorStore((s) => s.toggleRulers);
  const toggleSafeArea = useEditorStore((s) => s.toggleSafeArea);
  const addGuide = useEditorStore((s) => s.addGuide);
  const clearGuides = useEditorStore((s) => s.clearGuides);

  const [customW, setCustomW] = useState(documentPreset.width);
  const [customH, setCustomH] = useState(documentPreset.height);
  const [guidePos, setGuidePos] = useState(100);
  const [guideType, setGuideType] = useState<"horizontal" | "vertical">("horizontal");

  const handlePresetSelect = (presetId: string) => {
    const preset = DOCUMENT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setDocumentPreset(preset);
      setCustomW(preset.width);
      setCustomH(preset.height);
    }
  };

  const handleApplyCustomSize = () => {
    setCustomDocumentSize(customW, customH, "Custom Canvas");
  };

  return (
    <div className="space-y-4 text-xs select-none">
      {/* 1. Canvas Dimensions & Presets */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Layout className="w-3.5 h-3.5 text-slate-200" />
          <span>Canvas Size & Presets</span>
        </div>

        {/* Preset Selector */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Select Preset:</label>
          <select
            value={documentPreset.id}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
          >
            {DOCUMENT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="custom">Custom Size</option>
          </select>
        </div>

        {/* Width & Height Input */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">Width (px):</label>
            <input
              type="number"
              value={customW}
              onChange={(e) => setCustomW(Number(e.target.value))}
              onBlur={handleApplyCustomSize}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-2 py-1 font-mono focus:outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">Height (px):</label>
            <input
              type="number"
              value={customH}
              onChange={(e) => setCustomH(Number(e.target.value))}
              onBlur={handleApplyCustomSize}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-2 py-1 font-mono focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Document Background Panel */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-slate-200" />
          <span>Canvas Background</span>
        </div>

        {/* Background Type */}
        <div className="grid grid-cols-3 gap-1.5">
          {(["solid", "gradient", "transparent"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDocumentBackground({ type })}
              className={`py-1 text-[10px] font-semibold uppercase tracking-wider rounded border transition-colors ${
                documentBackground.type === type
                  ? "bg-slate-700 border-slate-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Color picker for solid background */}
        {documentBackground.type === "solid" && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-slate-300">Fill Color:</span>
            <input
              type="color"
              value={documentBackground.color || "#ffffff"}
              onChange={(e) => setDocumentBackground({ color: e.target.value })}
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
          </div>
        )}

        {/* Gradient Controls */}
        {documentBackground.type === "gradient" && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Color 1:</span>
              <input
                type="color"
                value={documentBackground.color || "#ffffff"}
                onChange={(e) => setDocumentBackground({ color: e.target.value })}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Color 2:</span>
              <input
                type="color"
                value={documentBackground.color2 || "#3b82f6"}
                onChange={(e) => setDocumentBackground({ color2: e.target.value })}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Angle:</span>
                <span>{documentBackground.angle || 90}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={documentBackground.angle || 90}
                onChange={(e) => setDocumentBackground({ angle: Number(e.target.value) })}
                className="w-full accent-slate-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Overlays, Grid & Guides Panel */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Eye className="w-3.5 h-3.5 text-slate-200" />
          <span>Editor Overlays & Guides</span>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          {/* Smart Guides */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300">Smart Guides</span>
            <input
              type="checkbox"
              checked={smartGuides}
              onChange={(e) => setSmartGuides(e.target.checked)}
              className="accent-slate-400 rounded cursor-pointer"
            />
          </label>

          {/* Grid Overlay */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300">Show Design Grid</span>
            <input
              type="checkbox"
              checked={grid.visible}
              onChange={toggleGrid}
              className="accent-slate-400 rounded cursor-pointer"
            />
          </label>

          {/* Rulers */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300 flex items-center gap-1">
              <Ruler className="w-3 h-3 text-slate-400" /> Rulers
            </span>
            <input
              type="checkbox"
              checked={showRulers}
              onChange={toggleRulers}
              className="accent-slate-400 rounded cursor-pointer"
            />
          </label>

          {/* Safe Area */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300 flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" /> Safe Area Margins
            </span>
            <input
              type="checkbox"
              checked={showSafeArea}
              onChange={toggleSafeArea}
              className="accent-slate-400 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Grid Size Select */}
        {grid.visible && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-400">Grid Size:</span>
            <div className="flex gap-1">
              {[5, 10, 20, 50].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setGridSettings({ size: sz })}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                    grid.size === sz
                      ? "bg-slate-700 border-slate-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual Guide Adder */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 block">Manual Guides:</span>
          <div className="flex gap-1">
            <select
              value={guideType}
              onChange={(e) => setGuideType(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
            <input
              type="number"
              value={guidePos}
              onChange={(e) => setGuidePos(Number(e.target.value))}
              className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => addGuide(guideType, guidePos)}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium text-xs flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {guides.length > 0 && (
            <button
              type="button"
              onClick={clearGuides}
              className="w-full mt-1 py-1 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 rounded text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear All Guides ({guides.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
