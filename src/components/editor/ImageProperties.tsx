"use client";

import React from "react";
import { ImageObject, ClipFrameType } from "@/types/design";
import { useEditorStore } from "@/stores/editorStore";

interface ImagePropertiesProps {
  object: ImageObject;
}

export function ImageProperties({ object }: ImagePropertiesProps) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);

  const handleUpdate = (updates: Partial<ImageObject>) => {
    updateObject(object.id, updates);
  };

  const handleBlur = () => {
    commitHistorySnapshot();
  };

  return (
    <div className="space-y-3.5 select-none text-xs">
      {/* Clipping Frame */}
      <div>
        <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
          Clipping Frame
        </label>
        <select
          value={object.clipFrame}
          onChange={(e) => {
            handleUpdate({ clipFrame: e.target.value as ClipFrameType });
            commitHistorySnapshot();
          }}
          className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded p-1.5 text-xs outline-none cursor-pointer capitalize"
        >
          <option value="none">None (Full Rectangle)</option>
          <option value="rounded">Rounded Corners</option>
          <option value="circle">Circle / Oval</option>
        </select>
      </div>

      {/* Geometry readout */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Width</span>
          <input
            type="number"
            value={object.width}
            onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
            onBlur={handleBlur}
            className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded px-1.5 py-1 text-xs outline-none font-mono"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Height</span>
          <input
            type="number"
            value={object.height}
            onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
            onBlur={handleBlur}
            className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded px-1.5 py-1 text-xs outline-none font-mono"
          />
        </div>
      </div>

      {/* Rotation */}
      <div className="pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>Rotation</span>
          <span className="font-mono">{object.rotation}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={360}
          value={object.rotation}
          onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
          onPointerUp={handleBlur}
          className="w-full accent-slate-400 cursor-pointer"
        />
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
          className="w-full accent-slate-400 cursor-pointer"
        />
      </div>
    </div>
  );
}
