"use client";

import React from "react";
import { PRESETS, getPresetAdjustments } from "@/lib/presets/presets";
import { useEditorStore } from "@/stores/editorStore";
import { Sparkles, Check } from "lucide-react";

export function PresetsPanel() {
  const activePresetId = useEditorStore((s) => s.activePresetId);
  const applyPreset = useEditorStore((s) => s.applyPreset);
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === "dark";

  const handleApplyPreset = (presetId: string) => {
    const targetAdjustments = getPresetAdjustments(presetId);
    applyPreset(presetId, targetAdjustments);
  };

  return (
    <div className="space-y-2 select-none">
      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.id)}
              className="group relative flex flex-col justify-between p-2 rounded text-left transition-all"
              style={{
                backgroundColor: isActive
                  ? "var(--editor-active)"
                  : isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
                color: isActive ? "var(--editor-active-fg)" : "var(--editor-fg)",
                border: `1px solid ${
                  isActive
                    ? "var(--editor-active)"
                    : isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.08)"
                }`,
              }}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[11px] font-semibold tracking-tight truncate">
                  {preset.name}
                </span>
                {isActive && (
                  <div
                    className="p-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: "var(--editor-active-fg)",
                      color: "var(--editor-active)",
                    }}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <p
                className="text-[9px] line-clamp-2 mt-1 leading-snug"
                style={{
                  color: isActive ? "var(--editor-active-fg)" : "var(--editor-muted)",
                  opacity: isActive ? 0.8 : 1,
                }}
              >
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
