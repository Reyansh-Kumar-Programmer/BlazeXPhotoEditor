"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CurvePoint, ToneCurveChannel } from "@/types/editor";
import { useEditorStore } from "@/stores/editorStore";
import { CURVE_PRESETS, buildCurveLUT } from "@/lib/image/toneCurve";
import { RotateCcw, Sliders } from "lucide-react";

const CHANNELS: { id: ToneCurveChannel; label: string; color: string }[] = [
  { id: "rgb", label: "RGB", color: "#f8fafc" },
  { id: "red", label: "Red", color: "#ef4444" },
  { id: "green", label: "Green", color: "#22c55e" },
  { id: "blue", label: "Blue", color: "#3b82f6" },
];

export function ToneCurve() {
  const [activeChannel, setActiveChannel] = useState<ToneCurveChannel>("rgb");
  const [activePreset, setActivePreset] = useState<string>("linear");
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const curveState = useEditorStore((s) => s.adjustments.curve);
  const setCurvePoints = useEditorStore((s) => s.setCurvePoints);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === "dark";

  const points = curveState[activeChannel] || [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ];

  const activeColor = CHANNELS.find((c) => c.id === activeChannel)?.color || "#f8fafc";

  // Build SVG path from 256-bin LUT curve interpolation
  const lut = buildCurveLUT(points);
  let pathD = `M 0 ${255 - lut[0]}`;
  for (let i = 1; i < 256; i++) {
    pathD += ` L ${i} ${255 - lut[i]}`;
  }

  // Convert SVG client mouse event to 0..255 coordinates
  const getGraphCoords = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | MouseEvent): { x: number; y: number } | null => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? (e as unknown as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? (e as unknown as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const x = Math.min(255, Math.max(0, Math.round(((clientX - rect.left) / rect.width) * 255)));
      const y = Math.min(255, Math.max(0, Math.round((1 - (clientY - rect.top) / rect.height) * 255)));
      return { x, y };
    },
    []
  );

  const handlePointerDownPoint = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggedPointIndex(index);
    setSelectedPointIndex(index);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (draggedPointIndex === null) return;
      const coords = getGraphCoords(e);
      if (!coords) return;

      const updated = [...points];
      const count = updated.length;

      if (draggedPointIndex === 0) {
        // First point fixed at X=0
        updated[0] = { x: 0, y: coords.y };
      } else if (draggedPointIndex === count - 1) {
        // Last point fixed at X=255
        updated[count - 1] = { x: 255, y: coords.y };
      } else {
        // Intermediate point clamped between neighboring points
        const minX = updated[draggedPointIndex - 1].x + 2;
        const maxX = updated[draggedPointIndex + 1].x - 2;
        const clampedX = Math.min(maxX, Math.max(minX, coords.x));
        updated[draggedPointIndex] = { x: clampedX, y: coords.y };
      }

      setCurvePoints(activeChannel, updated);
    },
    [draggedPointIndex, getGraphCoords, points, setCurvePoints, activeChannel]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (draggedPointIndex !== null) {
        setDraggedPointIndex(null);
        commitHistorySnapshot();
      }
    },
    [draggedPointIndex, commitHistorySnapshot]
  );

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedPointIndex !== null) return;
    const coords = getGraphCoords(e);
    if (!coords) return;

    // Check if clicked close to an existing point
    const existingIndex = points.findIndex(
      (p) => Math.abs(p.x - coords.x) < 12 && Math.abs(p.y - coords.y) < 12
    );

    if (existingIndex !== -1) {
      setSelectedPointIndex(existingIndex);
      return;
    }

    // Insert new control point in sorted order
    const newPoints = [...points, coords].sort((a, b) => a.x - b.x);
    setCurvePoints(activeChannel, newPoints);
    commitHistorySnapshot();
    setSelectedPointIndex(newPoints.findIndex((p) => p.x === coords.x && p.y === coords.y));
  };

  const handlePointDoubleClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0 || index === points.length - 1) return; // Don't delete end points
    const updated = points.filter((_, i) => i !== index);
    setCurvePoints(activeChannel, updated);
    setSelectedPointIndex(null);
    commitHistorySnapshot();
  };

  const handleApplyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const target = CURVE_PRESETS.find((p) => p.id === presetId);
    if (target) {
      setCurvePoints(activeChannel, [...target.points]);
      commitHistorySnapshot();
    }
  };

  const resetCurrentChannel = () => {
    setCurvePoints(activeChannel, [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ]);
    setActivePreset("linear");
    commitHistorySnapshot();
  };

  return (
    <div className="space-y-2.5 select-none">
      {/* Channel selector tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-0.5 rounded" style={{ backgroundColor: "var(--editor-bg)" }}>
          {CHANNELS.map((ch) => {
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannel(ch.id)}
                className="px-2 py-0.5 rounded text-[10px] font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? "var(--editor-panel)" : "transparent",
                  color: isActive ? ch.color : "var(--editor-muted)",
                  border: isActive ? `1px solid ${ch.color}` : "1px solid transparent",
                }}
              >
                {ch.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={resetCurrentChannel}
          title="Reset current curve channel"
          className="p-1 rounded text-xs transition-colors"
          style={{ color: "var(--editor-muted)" }}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-mono text-[9px] uppercase font-semibold" style={{ color: "var(--editor-muted)" }}>
          Curve Preset
        </span>
        <select
          value={activePreset}
          onChange={(e) => handleApplyPreset(e.target.value)}
          className="px-1.5 py-0.5 rounded text-[10px] font-mono outline-none cursor-pointer"
          style={{
            backgroundColor: "var(--editor-bg)",
            color: "var(--editor-fg)",
            border: "1px solid var(--editor-border-subtle)",
          }}
        >
          {CURVE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* SVG Interactive Curve Canvas */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden" style={{ backgroundColor: "#0f172a" }}>
        <svg
          ref={svgRef}
          viewBox="0 0 255 255"
          className="w-full h-full cursor-crosshair touch-none"
          onClick={handleSvgClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Grid lines (4x4) */}
          <line x1="63.75" y1="0" x2="63.75" y2="255" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="127.5" y1="0" x2="127.5" y2="255" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <line x1="191.25" y1="0" x2="191.25" y2="255" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="0" y1="63.75" x2="255" y2="63.75" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="0" y1="127.5" x2="255" y2="127.5" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <line x1="0" y1="191.25" x2="255" y2="191.25" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

          {/* Linear Diagonal Reference */}
          <line x1="0" y1="255" x2="255" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Interpolated Smooth Curve Path */}
          <path d={pathD} fill="none" stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Draggable Control Points */}
          {points.map((pt, idx) => {
            const isSelected = selectedPointIndex === idx;
            return (
              <circle
                key={idx}
                cx={pt.x}
                cy={255 - pt.y}
                r={isSelected ? 6 : 4.5}
                fill={isSelected ? "#ffffff" : activeColor}
                stroke="#0f172a"
                strokeWidth="2"
                className="cursor-pointer transition-all hover:scale-125"
                onPointerDown={(e) => handlePointerDownPoint(idx, e)}
                onDoubleClick={(e) => handlePointDoubleClick(idx, e)}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono" style={{ color: "var(--editor-muted)" }}>
        <span>Click line to add point</span>
        <span>Double-click point to delete</span>
      </div>
    </div>
  );
}
