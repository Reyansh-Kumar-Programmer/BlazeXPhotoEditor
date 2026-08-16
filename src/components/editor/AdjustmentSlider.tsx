"use client";

import React, { useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";

export interface AdjustmentSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onReset?: () => void;
  defaultValue?: number;
}

export function AdjustmentSlider({
  label,
  value,
  min = -100,
  max = 100,
  step = 1,
  unit = "",
  onChange,
  onReset,
  defaultValue = 0,
}: AdjustmentSliderProps) {
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === "dark";

  const isChanged = value !== defaultValue;

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    } else {
      onChange(defaultValue);
      commitHistorySnapshot();
    }
  }, [onReset, onChange, defaultValue, commitHistorySnapshot]);

  const handlePointerUp = () => commitHistorySnapshot();

  const formattedValue = value > 0 ? `+${value}${unit}` : `${value}${unit}`;

  return (
    <div
      className="group flex flex-col gap-0.5 py-1 px-1 rounded transition-colors select-none"
      style={{
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--editor-panel-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent";
      }}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span
          onDoubleClick={handleReset}
          className="font-medium tracking-tight cursor-pointer transition-colors"
          style={{
            color: isChanged ? "var(--editor-fg)" : "var(--editor-muted)",
            fontWeight: isChanged ? 600 : 500,
          }}
        >
          {label}
        </span>

        <div className="flex items-center gap-1">
          <span
            className="font-mono text-[10px] min-w-[32px] text-right font-medium"
            style={{ color: isChanged ? "var(--editor-fg)" : "var(--editor-muted)" }}
          >
            {formattedValue}
          </span>

          <button
            type="button"
            onClick={handleReset}
            disabled={!isChanged}
            title={`Reset ${label}`}
            aria-label={`Reset ${label}`}
            className="p-0.5 rounded transition-opacity"
            style={{
              opacity: isChanged ? 0.6 : 0,
              pointerEvents: isChanged ? "auto" : "none",
              color: "var(--editor-muted)",
            }}
          >
            <RotateCcw className="w-2.5 h-2.5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      <div className="relative flex items-center h-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerUp={handlePointerUp}
          onMouseUp={handlePointerUp}
          aria-label={label}
          aria-valuenow={value}
          className="w-full"
        />
      </div>
    </div>
  );
}
