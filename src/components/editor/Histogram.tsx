"use client";

import React, { useMemo } from "react";
import { useEditorStore } from "@/stores/editorStore";

interface HistogramProps {
  className?: string;
}

export function Histogram({ className = "" }: HistogramProps) {
  const histogram = useEditorStore((s) => s.histogram);
  const image = useEditorStore((s) => s.image);

  const paths = useMemo(() => {
    if (!histogram) return null;

    const { r, g, b, l } = histogram;
    const maxVal = Math.max(
      Math.max(...r),
      Math.max(...g),
      Math.max(...b),
      Math.max(...l),
      1
    );

    const buildPath = (data: number[]) => {
      let path = "";
      for (let i = 0; i < 256; i += 2) {
        const x = (i / 255) * 200;
        const val = data[i] || 0;
        const y = 70 - (val / maxVal) * 62;
        path += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      return path;
    };

    return {
      rPath: buildPath(r),
      gPath: buildPath(g),
      bPath: buildPath(b),
      lPath: buildPath(l),
      lFillPath: `${buildPath(l)} L 200 70 L 0 70 Z`,
    };
  }, [histogram]);

  return (
    <div
      className={`relative w-full h-28 rounded overflow-hidden flex flex-col justify-between p-2 select-none ${className}`}
      style={{
        backgroundColor: "#0f1014",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-[9px] font-mono z-10" style={{ color: "rgba(255,255,255,0.4)" }}>
        <span style={{ color: "rgba(255,255,255,0.7)" }}>
          {image.isLoaded ? `${image.width}×${image.height}` : "—"}
        </span>
        <span className="uppercase tracking-wider font-bold text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Histogram
        </span>
      </div>

      {/* SVG */}
      <div className="absolute inset-0 top-5 bottom-4 px-1 flex items-end">
        <svg viewBox="0 0 200 70" className="w-full h-full" fill="none">
          <line x1="50" y1="0" x2="50" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="100" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="150" y1="0" x2="150" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

          {paths ? (
            <>
              <path d={paths.lFillPath} fill="url(#hg)" opacity="0.25" />
              <path d={paths.rPath} stroke="#ef4444" strokeWidth="1" opacity="0.7" fill="none" />
              <path d={paths.gPath} stroke="#22c55e" strokeWidth="1" opacity="0.7" fill="none" />
              <path d={paths.bPath} stroke="#3b82f6" strokeWidth="1" opacity="0.7" fill="none" />
              <path d={paths.lPath} stroke="#ffffff" strokeWidth="1.2" fill="none" />
            </>
          ) : (
            <>
              <path d="M 0 70 Q 20 65, 35 50 T 70 25 T 110 38 T 150 12 T 180 42 T 200 70 Z" fill="url(#hg)" opacity="0.2" />
              <path d="M 0 70 Q 25 60, 45 42 T 80 32 T 120 15 T 160 25 T 200 70" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
              <path d="M 0 70 Q 15 55, 35 37 T 75 18 T 115 28 T 155 8 T 200 70" stroke="#22c55e" strokeWidth="1" opacity="0.6" />
              <path d="M 0 70 Q 30 68, 50 55 T 90 15 T 130 42 T 170 18 T 200 70" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
              <path d="M 0 70 Q 20 65, 35 50 T 70 25 T 110 38 T 150 12 T 180 42 T 200 70" stroke="#ffffff" strokeWidth="1.2" />
            </>
          )}

          <defs>
            <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[8px] font-mono z-10" style={{ color: "rgba(255,255,255,0.35)" }}>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5">
            <span className="h-1 w-1 rounded-full bg-red-500 inline-block" /> R
          </span>
          <span className="flex items-center gap-0.5">
            <span className="h-1 w-1 rounded-full bg-green-500 inline-block" /> G
          </span>
          <span className="flex items-center gap-0.5">
            <span className="h-1 w-1 rounded-full bg-slate-600 inline-block" /> B
          </span>
        </div>
        <span>sRGB</span>
      </div>
    </div>
  );
}
