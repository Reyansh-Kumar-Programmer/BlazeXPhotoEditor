"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { DOCUMENT_PRESETS, DocumentPreset } from "@/types/design";
import { Plus, X, Sparkles } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const createNewProject = useEditorStore((s) => s.createNewProject);

  const [selectedPresetId, setSelectedPresetId] = useState<string>("insta_post");
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1080);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgType, setBgType] = useState<"solid" | "transparent">("solid");

  if (!isOpen) return null;

  const handleCreate = () => {
    let preset: DocumentPreset;
    if (selectedPresetId === "custom") {
      preset = {
        id: `custom_${Date.now()}`,
        name: `Custom Canvas (${customW} × ${customH})`,
        width: Math.max(100, Math.min(8000, customW)),
        height: Math.max(100, Math.min(8000, customH)),
        category: "Custom",
      };
    } else {
      preset = DOCUMENT_PRESETS.find((p) => p.id === selectedPresetId) || DOCUMENT_PRESETS[0];
    }

    createNewProject(preset, {
      type: bgType,
      color: bgColor,
      opacity: 1,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-white tracking-wide">Create New Design Canvas</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Preset Cards Grid */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400 block mb-2.5">
              Select Preset Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DOCUMENT_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(p.id);
                      setCustomW(p.width);
                      setCustomH(p.height);
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "bg-zinc-800 border-zinc-400 text-white shadow-lg ring-1 ring-zinc-400"
                        : "bg-zinc-900/80 border-zinc-800/90 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-100">{p.name.split("(")[0].trim()}</div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-1">
                        {p.width} × {p.height} px
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-zinc-800 text-zinc-400 border border-zinc-700/60 px-1.5 py-0.5 rounded self-start mt-2.5">
                      {p.category}
                    </span>
                  </button>
                );
              })}

              {/* Custom Size Card */}
              <button
                type="button"
                onClick={() => setSelectedPresetId("custom")}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  selectedPresetId === "custom"
                    ? "bg-zinc-800 border-zinc-400 text-white shadow-lg ring-1 ring-zinc-400"
                    : "bg-zinc-900/80 border-zinc-800/90 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-zinc-100">Custom Size</div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-1">Specify Dimensions</div>
                </div>
                <span className="text-[9px] font-mono uppercase bg-zinc-800 text-zinc-400 border border-zinc-700/60 px-1.5 py-0.5 rounded self-start mt-2.5">
                  Custom
                </span>
              </button>
            </div>
          </div>

          {/* Custom Dimension Inputs */}
          {selectedPresetId === "custom" && (
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-lg space-y-2.5">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-300 block">
                Custom Dimensions
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                    Width (px):
                  </label>
                  <input
                    type="number"
                    value={customW}
                    onChange={(e) => setCustomW(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                    Height (px):
                  </label>
                  <input
                    type="number"
                    value={customH}
                    onChange={(e) => setCustomH(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Background Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400 block">
              Canvas Background
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBgType("solid")}
                className={`px-3.5 py-1.5 text-xs rounded border transition-colors ${
                  bgType === "solid"
                    ? "bg-zinc-800 border-zinc-500 text-white font-semibold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Solid Color
              </button>
              <button
                type="button"
                onClick={() => setBgType("transparent")}
                className={`px-3.5 py-1.5 text-xs rounded border transition-colors ${
                  bgType === "transparent"
                    ? "bg-zinc-800 border-zinc-500 text-white font-semibold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Transparent
              </button>
              {bgType === "solid" && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-mono text-zinc-400">Color:</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800/80 bg-black/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded-lg font-medium border border-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="px-5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs rounded-lg font-bold flex items-center gap-1.5 shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
