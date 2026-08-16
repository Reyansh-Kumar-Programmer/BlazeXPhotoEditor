"use client";

import React, { useState } from "react";
import { ShapeObject, ShapeType } from "@/types/design";
import { useEditorStore } from "@/stores/editorStore";

interface ShapePropertiesProps {
  object: ShapeObject;
}

export function ShapeProperties({ object }: ShapePropertiesProps) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);

  const [useGradient, setUseGradient] = useState<boolean>(!!object.gradientFill);

  const handleUpdate = (updates: Partial<ShapeObject>) => {
    updateObject(object.id, updates);
  };

  const handleBlur = () => {
    commitHistorySnapshot();
  };

  const toggleGradient = (enable: boolean) => {
    setUseGradient(enable);
    if (enable) {
      handleUpdate({
        gradientFill: {
          type: "linear",
          color1: object.fill || "#3b82f6",
          color2: "#9333ea",
          angle: 90,
        },
      });
    } else {
      handleUpdate({ gradientFill: undefined });
    }
    commitHistorySnapshot();
  };

  return (
    <div className="space-y-3.5 select-none text-xs">
      {/* Shape Type Selector */}
      <div>
        <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
          Shape Type
        </label>
        <select
          value={object.shapeType}
          onChange={(e) => {
            handleUpdate({ shapeType: e.target.value as ShapeType });
            commitHistorySnapshot();
          }}
          className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded p-1.5 text-xs outline-none cursor-pointer capitalize"
        >
          <option value="rectangle">Rectangle</option>
          <option value="rounded-rectangle">Rounded Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
          <option value="star">Star</option>
        </select>
      </div>

      {/* Fill Type Switch (Solid vs Gradient) */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-semibold text-slate-400 mb-1">
          <span>Fill</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleGradient(false)}
              className={`px-1.5 py-0.5 rounded text-[9px] ${
                !useGradient ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() => toggleGradient(true)}
              className={`px-1.5 py-0.5 rounded text-[9px] ${
                useGradient ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              Gradient
            </button>
          </div>
        </div>

        {!useGradient ? (
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={object.fill.startsWith("#") ? object.fill : "#3b82f6"}
              onChange={(e) => handleUpdate({ fill: e.target.value })}
              onBlur={handleBlur}
              className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={object.fill}
              onChange={(e) => handleUpdate({ fill: e.target.value })}
              onBlur={handleBlur}
              className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded px-1.5 py-1 text-[11px] font-mono outline-none"
            />
          </div>
        ) : (
          <div className="space-y-2 bg-slate-950 p-2 rounded border border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Color 1</span>
                <input
                  type="color"
                  value={object.gradientFill?.color1 || "#3b82f6"}
                  onChange={(e) =>
                    handleUpdate({
                      gradientFill: {
                        ...object.gradientFill!,
                        color1: e.target.value,
                      },
                    })
                  }
                  onBlur={handleBlur}
                  className="w-full h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Color 2</span>
                <input
                  type="color"
                  value={object.gradientFill?.color2 || "#9333ea"}
                  onChange={(e) =>
                    handleUpdate({
                      gradientFill: {
                        ...object.gradientFill!,
                        color2: e.target.value,
                      },
                    })
                  }
                  onBlur={handleBlur}
                  className="w-full h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Angle</span>
                <span className="font-mono">{object.gradientFill?.angle || 90}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={object.gradientFill?.angle || 90}
                onChange={(e) =>
                  handleUpdate({
                    gradientFill: {
                      ...object.gradientFill!,
                      angle: Number(e.target.value),
                    },
                  })
                }
                onPointerUp={handleBlur}
                className="w-full accent-slate-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stroke Color & Stroke Width */}
      <div className="grid grid-cols-2 gap-2 items-center pt-1 border-t border-slate-800">
        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
            Stroke Color
          </label>
          <input
            type="color"
            value={object.stroke.startsWith("#") ? object.stroke : "#ffffff"}
            onChange={(e) => handleUpdate({ stroke: e.target.value })}
            onBlur={handleBlur}
            className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Stroke Width</span>
            <span className="font-mono">{object.strokeWidth}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={object.strokeWidth}
            onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
            onPointerUp={handleBlur}
            className="w-full accent-slate-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Corner Radius (For Rounded Rectangle) */}
      {object.shapeType === "rounded-rectangle" && (
        <div className="pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Corner Radius</span>
            <span className="font-mono">{object.cornerRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={object.cornerRadius}
            onChange={(e) => handleUpdate({ cornerRadius: Number(e.target.value) })}
            onPointerUp={handleBlur}
            className="w-full accent-slate-400 cursor-pointer"
          />
        </div>
      )}

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
