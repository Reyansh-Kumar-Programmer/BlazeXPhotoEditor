"use client";

import React from "react";
import { TextObject, CURATED_FONTS } from "@/types/design";
import { useEditorStore } from "@/stores/editorStore";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";

interface TextPropertiesProps {
  object: TextObject;
}

export function TextProperties({ object }: TextPropertiesProps) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);

  const handleUpdate = (updates: Partial<TextObject>) => {
    updateObject(object.id, updates);
  };

  const handleBlur = () => {
    commitHistorySnapshot();
  };

  return (
    <div className="space-y-3.5 select-none text-xs">
      {/* Content Textarea */}
      <div>
        <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
          Text Content
        </label>
        <textarea
          value={object.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          onBlur={handleBlur}
          rows={2}
          className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded p-1.5 text-xs outline-none focus:border-slate-500 resize-none font-sans"
        />
      </div>

      {/* Font Family & Size */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
            Font
          </label>
          <select
            value={object.fontFamily}
            onChange={(e) => {
              handleUpdate({ fontFamily: e.target.value });
              commitHistorySnapshot();
            }}
            className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded p-1 text-xs outline-none cursor-pointer"
          >
            {CURATED_FONTS.map((f) => (
              <option key={f.name} value={f.family}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
            Size ({object.fontSize}px)
          </label>
          <input
            type="range"
            min={12}
            max={120}
            value={object.fontSize}
            onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
            onPointerUp={handleBlur}
            className="w-full accent-slate-200 cursor-pointer"
          />
        </div>
      </div>

      {/* Weight & Color */}
      <div className="grid grid-cols-2 gap-2 items-center">
        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
            Weight
          </label>
          <select
            value={object.fontWeight}
            onChange={(e) => {
              handleUpdate({ fontWeight: Number(e.target.value) });
              commitHistorySnapshot();
            }}
            className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded p-1 text-xs outline-none cursor-pointer"
          >
            <option value={300}>Light 300</option>
            <option value={400}>Regular 400</option>
            <option value={500}>Medium 500</option>
            <option value={600}>Semi-Bold 600</option>
            <option value={700}>Bold 700</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
            Color
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={object.color}
              onChange={(e) => handleUpdate({ color: e.target.value })}
              onBlur={handleBlur}
              className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={object.color}
              onChange={(e) => handleUpdate({ color: e.target.value })}
              onBlur={handleBlur}
              className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded px-1.5 py-1 text-[11px] font-mono outline-none"
            />
          </div>
        </div>
      </div>

      {/* Alignment & Format Toggles */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded border border-slate-800">
          <button
            type="button"
            onClick={() => {
              handleUpdate({ textAlign: "left" });
              commitHistorySnapshot();
            }}
            className={`p-1 rounded ${
              object.textAlign === "left" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              handleUpdate({ textAlign: "center" });
              commitHistorySnapshot();
            }}
            className={`p-1 rounded ${
              object.textAlign === "center" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              handleUpdate({ textAlign: "right" });
              commitHistorySnapshot();
            }}
            className={`p-1 rounded ${
              object.textAlign === "right" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded border border-slate-800">
          <button
            type="button"
            onClick={() => {
              handleUpdate({ italic: !object.italic });
              commitHistorySnapshot();
            }}
            className={`p-1 rounded ${
              object.italic ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              handleUpdate({ underline: !object.underline });
              commitHistorySnapshot();
            }}
            className={`p-1 rounded ${
              object.underline ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Letter Spacing & Line Height */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Spacing</span>
            <span className="font-mono">{object.letterSpacing}px</span>
          </div>
          <input
            type="range"
            min={-5}
            max={20}
            value={object.letterSpacing}
            onChange={(e) => handleUpdate({ letterSpacing: Number(e.target.value) })}
            onPointerUp={handleBlur}
            className="w-full accent-slate-200 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Line Height</span>
            <span className="font-mono">{object.lineHeight}</span>
          </div>
          <input
            type="range"
            min={0.8}
            max={2.5}
            step={0.1}
            value={object.lineHeight}
            onChange={(e) => handleUpdate({ lineHeight: Number(e.target.value) })}
            onPointerUp={handleBlur}
            className="w-full accent-slate-200 cursor-pointer"
          />
        </div>
      </div>

      {/* Opacity */}
      <div className="pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>Opacity</span>
          <span className="font-mono">{Math.round(object.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={object.opacity}
          onChange={(e) => handleUpdate({ opacity: Number(e.target.value) })}
          onPointerUp={handleBlur}
          className="w-full accent-slate-200 cursor-pointer"
        />
      </div>

      {/* Shadow */}
      <div className="pt-1 border-t border-slate-800 space-y-2">
        <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
          Text Shadow
        </span>
        <div className="grid grid-cols-2 gap-2 items-center">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Shadow Color</span>
            <input
              type="color"
              value={object.shadowColor.startsWith("#") ? object.shadowColor : "#000000"}
              onChange={(e) => handleUpdate({ shadowColor: e.target.value })}
              onBlur={handleBlur}
              className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Blur ({object.shadowBlur}px)</span>
            <input
              type="range"
              min={0}
              max={20}
              value={object.shadowBlur}
              onChange={(e) => handleUpdate({ shadowBlur: Number(e.target.value) })}
              onPointerUp={handleBlur}
              className="w-full accent-slate-200 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
