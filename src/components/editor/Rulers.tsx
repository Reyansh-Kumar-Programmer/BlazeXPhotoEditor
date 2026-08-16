"use client";

import React, { useMemo } from "react";
import { useEditorStore } from "@/stores/editorStore";

export function Rulers() {
  const showRulers = useEditorStore((s) => s.showRulers);
  const documentPreset = useEditorStore((s) => s.documentPreset);
  const addGuide = useEditorStore((s) => s.addGuide);

  const docW = documentPreset.width;
  const docH = documentPreset.height;

  // Generate tick marks for top ruler (horizontal)
  const hTicks = useMemo(() => {
    const ticks = [];
    const step = 50;
    for (let x = 0; x <= docW; x += step) {
      ticks.push({ pos: x, isMajor: x % 100 === 0 });
    }
    return ticks;
  }, [docW]);

  // Generate tick marks for left ruler (vertical)
  const vTicks = useMemo(() => {
    const ticks = [];
    const step = 50;
    for (let y = 0; y <= docH; y += step) {
      ticks.push({ pos: y, isMajor: y % 100 === 0 });
    }
    return ticks;
  }, [docH]);

  if (!showRulers) return null;

  return (
    <>
      {/* Top Horizontal Ruler */}
      <div
        className="absolute -top-6 left-0 h-6 bg-slate-950/90 border-b border-slate-700/80 select-none overflow-hidden cursor-pointer z-30 group"
        style={{ width: `${docW}px` }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          addGuide("vertical", clickX);
        }}
        title="Click to add vertical guide"
      >
        <div className="relative w-full h-full">
          {hTicks.map((t) => (
            <div
              key={`h_${t.pos}`}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${t.pos}px` }}
            >
              <div
                className={`w-px ${t.isMajor ? "h-3.5 bg-slate-300" : "h-2 bg-slate-500"}`}
              />
              {t.isMajor && (
                <span className="text-[8px] font-mono text-slate-400 -mt-0.5 leading-none">
                  {t.pos}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Left Vertical Ruler */}
      <div
        className="absolute top-0 -left-6 w-6 bg-slate-950/90 border-r border-slate-700/80 select-none overflow-hidden cursor-pointer z-30 group"
        style={{ height: `${docH}px` }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          addGuide("horizontal", clickY);
        }}
        title="Click to add horizontal guide"
      >
        <div className="relative w-full h-full">
          {vTicks.map((t) => (
            <div
              key={`v_${t.pos}`}
              className="absolute left-0 flex items-center"
              style={{ top: `${t.pos}px` }}
            >
              <div
                className={`h-px ${t.isMajor ? "w-3.5 bg-slate-300" : "w-2 bg-slate-500"}`}
              />
              {t.isMajor && (
                <span className="text-[8px] font-mono text-slate-400 ml-0.5 leading-none rotate-90 origin-left">
                  {t.pos}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
