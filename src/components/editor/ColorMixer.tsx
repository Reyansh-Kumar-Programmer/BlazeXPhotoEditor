"use client";

import React, { useState } from "react";
import { HSLChannelName } from "@/types/editor";
import { useEditorStore } from "@/stores/editorStore";
import { AdjustmentSlider } from "./AdjustmentSlider";
import { RotateCcw } from "lucide-react";

const CHANNELS: { id: HSLChannelName; label: string; color: string }[] = [
  { id: "red", label: "Red", color: "#ef4444" },
  { id: "orange", label: "Orange", color: "#f97316" },
  { id: "yellow", label: "Yellow", color: "#eab308" },
  { id: "green", label: "Green", color: "#22c55e" },
  { id: "aqua", label: "Aqua", color: "#06b6d4" },
  { id: "blue", label: "Blue", color: "#3b82f6" },
  { id: "purple", label: "Purple", color: "#a855f7" },
  { id: "magenta", label: "Magenta", color: "#ec4899" },
];

export function ColorMixer() {
  const [activeChannel, setActiveChannel] = useState<HSLChannelName>("red");
  const hsl = useEditorStore((s) => s.adjustments.hsl);
  const setHSLAdjustment = useEditorStore((s) => s.setHSLAdjustment);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === "dark";

  const currentChannelData = hsl[activeChannel] || { hue: 0, saturation: 0, luminance: 0 };
  const hasChannelChanges = Boolean(
    currentChannelData.hue || currentChannelData.saturation || currentChannelData.luminance
  );

  const resetActiveChannel = () => {
    setHSLAdjustment(activeChannel, "hue", 0);
    setHSLAdjustment(activeChannel, "saturation", 0);
    setHSLAdjustment(activeChannel, "luminance", 0);
    commitHistorySnapshot();
  };

  return (
    <div className="space-y-3 select-none">
      {/* Channel selector chips grid (4x2) */}
      <div className="grid grid-cols-4 gap-1">
        {CHANNELS.map((ch) => {
          const isActive = activeChannel === ch.id;
          const channelData = hsl[ch.id];
          const isModified = Boolean(
            channelData && (channelData.hue || channelData.saturation || channelData.luminance)
          );

          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChannel(ch.id)}
              className="relative flex items-center justify-center gap-1.5 py-1 px-1 rounded text-[10px] font-semibold transition-all"
              style={{
                backgroundColor: isActive
                  ? "var(--editor-active)"
                  : isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
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
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: ch.color }}
              />
              <span className="truncate">{ch.label}</span>
              {isModified && !isActive && (
                <span
                  className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full"
                  style={{ backgroundColor: ch.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active channel sliders header */}
      <div
        className="flex items-center justify-between pt-1 text-[10px] font-mono"
        style={{ borderTop: "1px solid var(--editor-border-subtle)" }}
      >
        <span className="font-semibold uppercase tracking-wider text-[9px]" style={{ color: "var(--editor-muted)" }}>
          {CHANNELS.find((c) => c.id === activeChannel)?.label} Channel
        </span>

        {hasChannelChanges && (
          <button
            type="button"
            onClick={resetActiveChannel}
            title={`Reset ${activeChannel} channel`}
            className="flex items-center gap-1 text-[9px] font-medium transition-colors"
            style={{ color: "var(--editor-muted)" }}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset Channel</span>
          </button>
        )}
      </div>

      {/* Sliders for active channel */}
      <div className="space-y-0.5">
        <AdjustmentSlider
          label="Hue"
          value={currentChannelData.hue}
          min={-100}
          max={100}
          onChange={(v) => setHSLAdjustment(activeChannel, "hue", v)}
          onReset={() => {
            setHSLAdjustment(activeChannel, "hue", 0);
            commitHistorySnapshot();
          }}
        />

        <AdjustmentSlider
          label="Saturation"
          value={currentChannelData.saturation}
          min={-100}
          max={100}
          onChange={(v) => setHSLAdjustment(activeChannel, "saturation", v)}
          onReset={() => {
            setHSLAdjustment(activeChannel, "saturation", 0);
            commitHistorySnapshot();
          }}
        />

        <AdjustmentSlider
          label="Luminance"
          value={currentChannelData.luminance}
          min={-100}
          max={100}
          onChange={(v) => setHSLAdjustment(activeChannel, "luminance", v)}
          onReset={() => {
            setHSLAdjustment(activeChannel, "luminance", 0);
            commitHistorySnapshot();
          }}
        />
      </div>
    </div>
  );
}
