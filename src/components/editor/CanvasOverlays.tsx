"use client";

import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { X } from "lucide-react";

export function CanvasOverlays() {
  const documentPreset = useEditorStore((s) => s.documentPreset);
  const documentBackground = useEditorStore((s) => s.documentBackground);
  const grid = useEditorStore((s) => s.grid);
  const guides = useEditorStore((s) => s.guides);
  const removeGuide = useEditorStore((s) => s.removeGuide);
  const showSafeArea = useEditorStore((s) => s.showSafeArea);

  const docW = documentPreset.width;
  const docH = documentPreset.height;

  // Render Background Style
  const renderBackgroundStyle = () => {
    if (documentBackground.type === "transparent") {
      return {
        backgroundImage: `
          linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
          linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
          linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
        `,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        backgroundColor: "#ffffff",
      };
    }

    if (documentBackground.type === "gradient") {
      const angle = documentBackground.angle || 90;
      const c1 = documentBackground.color || "#ffffff";
      const c2 = documentBackground.color2 || "#3b82f6";
      return {
        background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
        opacity: documentBackground.opacity ?? 1,
      };
    }

    return {
      backgroundColor: documentBackground.color || "#ffffff",
      opacity: documentBackground.opacity ?? 1,
    };
  };

  return (
    <>
      {/* Background Fill Layer */}
      <div className="absolute inset-0 pointer-events-none z-0" style={renderBackgroundStyle()} />

      {/* Editor Grid Overlay */}
      {grid.visible && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
          <defs>
            <pattern
              id="grid_pattern"
              width={grid.size}
              height={grid.size}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${grid.size} 0 L 0 0 0 ${grid.size}`}
                fill="none"
                stroke="#64748b"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid_pattern)" />
        </svg>
      )}

      {/* Safe Area Overlay */}
      {showSafeArea && (
        <div
          className="absolute border-2 border-dashed border-cyan-400/70 pointer-events-none z-20 flex items-start justify-end p-2"
          style={{
            left: `${docW * 0.05}px`,
            top: `${docH * 0.05}px`,
            width: `${docW * 0.9}px`,
            height: `${docH * 0.9}px`,
          }}
        >
          <span className="text-[9px] font-mono uppercase bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded">
            Safe Area (90%)
          </span>
        </div>
      )}

      {/* Manual Guides Overlay */}
      {guides.map((g) => (
        <div
          key={g.id}
          className="absolute bg-cyan-400 z-30 group"
          style={
            g.type === "horizontal"
              ? { top: `${g.position}px`, left: 0, width: "100%", height: "1px" }
              : { left: `${g.position}px`, top: 0, height: "100%", width: "1px" }
          }
        >
          <button
            type="button"
            onClick={() => removeGuide(g.id)}
            title="Remove Guide"
            className="hidden group-hover:flex items-center justify-center w-4 h-4 bg-cyan-600 text-white rounded-full absolute -translate-x-1/2 -translate-y-1/2 shadow cursor-pointer"
            style={
              g.type === "horizontal"
                ? { left: "12px", top: "0px" }
                : { top: "12px", left: "0px" }
            }
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </>
  );
}
