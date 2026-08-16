"use client";

import React, { useState, useEffect } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Link, Unlink } from "lucide-react";

export function TransformPanel() {
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const objects = useEditorStore((s) => s.objects);
  const updateObject = useEditorStore((s) => s.updateObject);
  const rotateActive = useEditorStore((s) => s.rotateActive);
  const flipActive = useEditorStore((s) => s.flipActive);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);

  const selectedObj = objects.find((o) => selectedObjectIds.includes(o.id));
  const [aspectLocked, setAspectLocked] = useState(true);

  if (!selectedObj) return null;

  const handleWidthChange = (val: number) => {
    const newW = Math.max(10, Math.round(val));
    if (aspectLocked && selectedObj.width > 0) {
      const ratio = selectedObj.height / selectedObj.width;
      const newH = Math.max(10, Math.round(newW * ratio));
      updateObject(selectedObj.id, { width: newW, height: newH });
    } else {
      updateObject(selectedObj.id, { width: newW });
    }
  };

  const handleHeightChange = (val: number) => {
    const newH = Math.max(10, Math.round(val));
    if (aspectLocked && selectedObj.height > 0) {
      const ratio = selectedObj.width / selectedObj.height;
      const newW = Math.max(10, Math.round(newH * ratio));
      updateObject(selectedObj.id, { width: newW, height: newH });
    } else {
      updateObject(selectedObj.id, { height: newH });
    }
  };

  return (
    <div className="space-y-2.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs select-none">
      <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
        Transform & Position
      </div>

      {/* X & Y Position */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1">
          <span className="text-[10px] font-mono text-slate-400">X:</span>
          <input
            type="number"
            value={Math.round(selectedObj.x)}
            onChange={(e) => updateObject(selectedObj.id, { x: Number(e.target.value) })}
            onBlur={commitHistorySnapshot}
            className="w-full bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1">
          <span className="text-[10px] font-mono text-slate-400">Y:</span>
          <input
            type="number"
            value={Math.round(selectedObj.y)}
            onChange={(e) => updateObject(selectedObj.id, { y: Number(e.target.value) })}
            onBlur={commitHistorySnapshot}
            className="w-full bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* W & H Size with Aspect Ratio Lock */}
      <div className="flex items-center gap-1.5">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1">
            <span className="text-[10px] font-mono text-slate-400">W:</span>
            <input
              type="number"
              value={Math.round(selectedObj.width)}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              onBlur={commitHistorySnapshot}
              className="w-full bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1">
            <span className="text-[10px] font-mono text-slate-400">H:</span>
            <input
              type="number"
              value={Math.round(selectedObj.height)}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              onBlur={commitHistorySnapshot}
              className="w-full bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Lock Aspect Ratio Toggle */}
        <button
          type="button"
          onClick={() => setAspectLocked(!aspectLocked)}
          title={aspectLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
          className={`p-1.5 rounded border transition-colors ${
            aspectLocked
              ? "bg-slate-700 border-slate-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
        >
          {aspectLocked ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Rotation & Flip Controls */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1 flex-1">
          <span className="text-[10px] font-mono text-slate-400">R:</span>
          <input
            type="number"
            value={Math.round(selectedObj.rotation)}
            onChange={(e) => updateObject(selectedObj.id, { rotation: Number(e.target.value) })}
            onBlur={commitHistorySnapshot}
            className="w-full bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
          />
          <span className="text-[10px] font-mono text-slate-400">°</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => rotateActive("left")}
            title="Rotate Left 90°"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => rotateActive("right")}
            title="Rotate Right 90°"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          {selectedObj.type === "image" && (
            <>
              <button
                type="button"
                onClick={() => flipActive("horizontal")}
                title="Flip Horizontal"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => flipActive("vertical")}
                title="Flip Vertical"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                <FlipVertical className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
