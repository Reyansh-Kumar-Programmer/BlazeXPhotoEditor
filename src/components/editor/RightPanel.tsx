"use client";

import React from "react";
import { PanelRightClose, PanelRightOpen, SlidersHorizontal, Layers as LayersIcon } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { Histogram } from "./Histogram";
import { AdjustmentSection } from "./AdjustmentSection";
import { AdjustmentSlider } from "./AdjustmentSlider";
import { ColorMixer } from "./ColorMixer";
import { ToneCurve } from "./ToneCurve";
import { PresetsPanel } from "./PresetsPanel";
import { LayersPanel } from "./LayersPanel";
import { TextProperties } from "./TextProperties";
import { ShapeProperties } from "./ShapeProperties";
import { ImageProperties } from "./ImageProperties";
import { TransformPanel } from "./TransformPanel";
import { DocumentProperties } from "./DocumentProperties";
import {
  BasicAdjustments,
  ColorAdjustments,
  DetailAdjustments,
  EffectAdjustments,
  OpticsAdjustments,
} from "@/types/editor";
import { ImageObject, ShapeObject, TextObject } from "@/types/design";

export function RightPanel() {
  const [activeDevelopTab, setActiveDevelopTab] = React.useState<"light" | "color" | "fx" | "detail" | "presets">("light");
  const isRightPanelOpen = useEditorStore((s) => s.isRightPanelOpen);
  const toggleRightPanel = useEditorStore((s) => s.toggleRightPanel);
  const mode = useEditorStore((s) => s.mode);
  const objects = useEditorStore((s) => s.objects);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const documentPreset = useEditorStore((s) => s.documentPreset);
  const adjustments = useEditorStore((s) => s.adjustments);

  const setBasicAdjustment = useEditorStore((s) => s.setBasicAdjustment);
  const setColorAdjustment = useEditorStore((s) => s.setColorAdjustment);
  const setEffectAdjustment = useEditorStore((s) => s.setEffectAdjustment);
  const setDetailAdjustment = useEditorStore((s) => s.setDetailAdjustment);
  const setOpticsAdjustment = useEditorStore((s) => s.setOpticsAdjustment);

  const resetSection = useEditorStore((s) => s.resetSection);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);

  const selectedObject = objects.find((o) => selectedObjectIds.includes(o.id));

  if (!isRightPanelOpen) {
    return (
      <div
        className="h-full flex flex-col items-center py-3 px-1 select-none z-20 shrink-0 transition-colors duration-200"
        style={{
          backgroundColor: "var(--editor-panel)",
          borderLeft: "1px solid var(--editor-border)",
        }}
      >
        <button
          type="button"
          onClick={toggleRightPanel}
          title="Open Edit Panel"
          className="p-1.5 rounded-md transition-colors"
          style={{ color: "var(--editor-muted)" }}
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { basic, color, effects, hsl, curve, detail, optics } = adjustments;

  const hasBasicChanges = Object.values(basic).some((v) => v !== 0);
  const hasColorChanges = Object.values(color).some((v) => v !== 0);
  const hasEffectsChanges = Object.values(effects).some((v) => v !== 0);
  const hasHslChanges = Object.values(hsl).some(
    (ch) => ch.hue !== 0 || ch.saturation !== 0 || ch.luminance !== 0
  );
  const hasCurveChanges =
    curve.rgb.some((p) => p.x !== p.y) ||
    curve.red.some((p) => p.x !== p.y) ||
    curve.green.some((p) => p.x !== p.y) ||
    curve.blue.some((p) => p.x !== p.y);
  const hasDetailChanges =
    detail.sharpnessAmount !== 0 ||
    detail.luminanceNoise !== 0 ||
    detail.colorNoise !== 25;
  const hasOpticsChanges =
    optics.enableLensCorrection ||
    optics.chromaticAberration ||
    optics.distortion !== 0 ||
    optics.vignetteAmount !== 0;

  const renderLightroomDevelopSections = () => (
    <div className="flex flex-col h-full">
      {/* HISTOGRAM */}
      <div className="p-2.5 shrink-0" style={{ borderBottom: "1px solid var(--editor-border)" }}>
        <Histogram />
      </div>

      {/* DEVELOP TABS */}
      <div className="flex items-center p-1.5 shrink-0 border-b overflow-x-auto no-scrollbar gap-1" style={{ borderColor: "var(--editor-border-subtle)" }}>
        {(
          [
            { id: "light", label: "Light" },
            { id: "color", label: "Color" },
            { id: "fx", label: "Effects" },
            { id: "detail", label: "Detail" },
            { id: "presets", label: "Presets" },
          ] as const
        ).map((tab) => {
          const isActive = activeDevelopTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDevelopTab(tab.id)}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap"
              style={{
                backgroundColor: isActive ? "var(--editor-active)" : "transparent",
                color: isActive ? "var(--editor-active-fg)" : "var(--editor-muted)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeDevelopTab === "light" && (
          <>
            {/* BASIC */}
            <AdjustmentSection
              title="Basic"
              defaultExpanded
              hasChanges={hasBasicChanges}
              onResetSection={() => resetSection("basic")}
            >
              {(
                [
                  { key: "exposure", label: "Exposure" },
                  { key: "contrast", label: "Contrast" },
                  { key: "highlights", label: "Highlights" },
                  { key: "shadows", label: "Shadows" },
                  { key: "whites", label: "Whites" },
                  { key: "blacks", label: "Blacks" },
                ] as const
              ).map((item) => (
                <AdjustmentSlider
                  key={item.key}
                  label={item.label}
                  value={basic[item.key as keyof BasicAdjustments]}
                  min={-100}
                  max={100}
                  onChange={(v) => setBasicAdjustment(item.key as keyof BasicAdjustments, v)}
                  onReset={() => {
                    setBasicAdjustment(item.key as keyof BasicAdjustments, 0);
                    commitHistorySnapshot();
                  }}
                />
              ))}
            </AdjustmentSection>

            {/* TONE CURVE */}
            <AdjustmentSection
              title="Tone Curve"
              defaultExpanded
              hasChanges={hasCurveChanges}
              onResetSection={() => resetSection("curve")}
            >
              <ToneCurve />
            </AdjustmentSection>
          </>
        )}

        {activeDevelopTab === "color" && (
          <>
            {/* COLOR */}
            <AdjustmentSection
              title="Color"
              defaultExpanded
              hasChanges={hasColorChanges}
              onResetSection={() => resetSection("color")}
            >
              {(
                [
                  { key: "temperature", label: "Temp" },
                  { key: "tint", label: "Tint" },
                  { key: "vibrance", label: "Vibrance" },
                  { key: "saturation", label: "Saturation" },
                ] as const
              ).map((item) => (
                <AdjustmentSlider
                  key={item.key}
                  label={item.label}
                  value={color[item.key as keyof ColorAdjustments]}
                  min={-100}
                  max={100}
                  onChange={(v) => setColorAdjustment(item.key as keyof ColorAdjustments, v)}
                  onReset={() => {
                    setColorAdjustment(item.key as keyof ColorAdjustments, 0);
                    commitHistorySnapshot();
                  }}
                />
              ))}
            </AdjustmentSection>

            {/* COLOR MIXER */}
            <AdjustmentSection
              title="Color Mixer"
              defaultExpanded
              hasChanges={hasHslChanges}
              onResetSection={() => resetSection("hsl")}
            >
              <ColorMixer />
            </AdjustmentSection>
          </>
        )}



        {activeDevelopTab === "fx" && (
          <>
            {/* EFFECTS */}
            <AdjustmentSection
              title="Effects"
              defaultExpanded
              hasChanges={hasEffectsChanges}
              onResetSection={() => resetSection("effects")}
            >
              {(
                [
                  { key: "texture", label: "Texture" },
                  { key: "clarity", label: "Clarity" },
                  { key: "dehaze", label: "Dehaze" },
                  { key: "vignette", label: "Vignette" },
                  { key: "grain", label: "Grain" },
                ] as const
              ).map((item) => (
                <AdjustmentSlider
                  key={item.key}
                  label={item.label}
                  value={effects[item.key as keyof EffectAdjustments]}
                  min={item.key === "grain" ? 0 : -100}
                  max={100}
                  onChange={(v) => setEffectAdjustment(item.key as keyof EffectAdjustments, v)}
                  onReset={() => {
                    setEffectAdjustment(item.key as keyof EffectAdjustments, 0);
                    commitHistorySnapshot();
                  }}
                />
              ))}
            </AdjustmentSection>

            {/* OPTICS */}
            <AdjustmentSection
              title="Optics"
              defaultExpanded={false}
              hasChanges={hasOpticsChanges}
              onResetSection={() => resetSection("optics")}
            >
              <div className="space-y-2.5">
                <label className="flex items-center justify-between text-xs cursor-pointer py-1">
                  <span className="text-[11px] font-medium" style={{ color: "var(--editor-fg)" }}>
                    Enable Lens Correction
                  </span>
                  <input
                    type="checkbox"
                    checked={optics.enableLensCorrection}
                    onChange={(e) => {
                      setOpticsAdjustment("enableLensCorrection", e.target.checked);
                      commitHistorySnapshot();
                    }}
                    className="rounded accent-slate-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer py-1">
                  <span className="text-[11px] font-medium" style={{ color: "var(--editor-fg)" }}>
                    Remove Chromatic Aberration
                  </span>
                  <input
                    type="checkbox"
                    checked={optics.chromaticAberration}
                    onChange={(e) => {
                      setOpticsAdjustment("chromaticAberration", e.target.checked);
                      commitHistorySnapshot();
                    }}
                    className="rounded accent-slate-400 cursor-pointer"
                  />
                </label>

                <div className="pt-2" style={{ borderTop: "1px solid var(--editor-border-subtle)" }}>
                  <AdjustmentSlider
                    label="Distortion"
                    value={optics.distortion}
                    min={-100}
                    max={100}
                    onChange={(v) => setOpticsAdjustment("distortion", v)}
                    onReset={() => {
                      setOpticsAdjustment("distortion", 0);
                      commitHistorySnapshot();
                    }}
                  />
                  <AdjustmentSlider
                    label="Vignette Midpoint"
                    value={optics.vignetteMidpoint}
                    min={0}
                    max={100}
                    onChange={(v) => setOpticsAdjustment("vignetteMidpoint", v)}
                    onReset={() => {
                      setOpticsAdjustment("vignetteMidpoint", 50);
                      commitHistorySnapshot();
                    }}
                  />
                  <AdjustmentSlider
                    label="Vignette Feather"
                    value={optics.vignetteFeather}
                    min={0}
                    max={100}
                    onChange={(v) => setOpticsAdjustment("vignetteFeather", v)}
                    onReset={() => {
                      setOpticsAdjustment("vignetteFeather", 50);
                      commitHistorySnapshot();
                    }}
                  />
                </div>
              </div>
            </AdjustmentSection>
          </>
        )}

        {activeDevelopTab === "detail" && (
          <AdjustmentSection
            title="Detail"
            defaultExpanded
            hasChanges={hasDetailChanges}
            onResetSection={() => resetSection("detail")}
          >
            <div className="space-y-3">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--editor-muted)" }}>
                  Sharpening
                </div>
                <AdjustmentSlider
                  label="Amount"
                  value={detail.sharpnessAmount}
                  min={0}
                  max={100}
                  onChange={(v) => setDetailAdjustment("sharpnessAmount", v)}
                  onReset={() => {
                    setDetailAdjustment("sharpnessAmount", 0);
                    commitHistorySnapshot();
                  }}
                />
                <AdjustmentSlider
                  label="Radius"
                  value={detail.sharpnessRadius}
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  onChange={(v) => setDetailAdjustment("sharpnessRadius", v)}
                  onReset={() => {
                    setDetailAdjustment("sharpnessRadius", 1.0);
                    commitHistorySnapshot();
                  }}
                />
                <AdjustmentSlider
                  label="Detail"
                  value={detail.sharpnessDetail}
                  min={0}
                  max={100}
                  onChange={(v) => setDetailAdjustment("sharpnessDetail", v)}
                  onReset={() => {
                    setDetailAdjustment("sharpnessDetail", 25);
                    commitHistorySnapshot();
                  }}
                />
                <AdjustmentSlider
                  label="Masking"
                  value={detail.sharpnessMasking}
                  min={0}
                  max={100}
                  onChange={(v) => setDetailAdjustment("sharpnessMasking", v)}
                  onReset={() => {
                    setDetailAdjustment("sharpnessMasking", 0);
                    commitHistorySnapshot();
                  }}
                />
              </div>

              <div className="pt-2" style={{ borderTop: "1px solid var(--editor-border-subtle)" }}>
                <div className="text-[9px] font-mono uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--editor-muted)" }}>
                  Noise Reduction
                </div>
                <AdjustmentSlider
                  label="Luminance"
                  value={detail.luminanceNoise}
                  min={0}
                  max={100}
                  onChange={(v) => setDetailAdjustment("luminanceNoise", v)}
                  onReset={() => {
                    setDetailAdjustment("luminanceNoise", 0);
                    commitHistorySnapshot();
                  }}
                />
                <AdjustmentSlider
                  label="Detail"
                  value={detail.noiseDetail}
                  min={0}
                  max={100}
                  onChange={(v) => setDetailAdjustment("noiseDetail", v)}
                  onReset={() => {
                    setDetailAdjustment("noiseDetail", 50);
                    commitHistorySnapshot();
                  }}
                />
                <AdjustmentSlider
                  label="Color"
                  value={detail.colorNoise}
                  min={0}
                  max={100}
                  onChange={(v) => setDetailAdjustment("colorNoise", v)}
                  onReset={() => {
                    setDetailAdjustment("colorNoise", 25);
                    commitHistorySnapshot();
                  }}
                />
              </div>
            </div>
          </AdjustmentSection>
        )}

        {activeDevelopTab === "presets" && (
          <div className="p-3">
            <PresetsPanel />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <aside
      className="w-64 sm:w-72 lg:w-80 h-full flex flex-col justify-between select-none z-20 shrink-0 transition-all duration-200"
      style={{
        backgroundColor: "var(--editor-panel)",
        borderLeft: "1px solid var(--editor-border)",
      }}
    >
      {/* Header */}
      <div
        className="h-9 px-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--editor-border-subtle)" }}
      >
        <div className="flex items-center gap-1.5">
          {mode === "develop" ? (
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--editor-muted)" }} />
          ) : (
            <LayersIcon className="w-3.5 h-3.5" style={{ color: "var(--editor-muted)" }} />
          )}
          <span className="text-[10px] font-bold tracking-widest font-mono uppercase" style={{ color: "var(--editor-muted)" }}>
            {mode === "develop" ? "Develop Studio" : "Design Inspector"}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleRightPanel}
          title="Collapse"
          className="p-1 rounded transition-colors"
          style={{ color: "var(--editor-muted)" }}
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Panel Content (Now handles its own scrolling because of tabs) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {mode === "develop" ? (
          renderLightroomDevelopSections()
        ) : (
          <div className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* Layers Section */}
            <div className="pb-3 border-b border-slate-800">
              <LayersPanel />
            </div>

            {/* Dynamic Object Inspector */}
            {selectedObject ? (
              <div className="space-y-3">
                <div className="text-[10px] font-mono uppercase font-extrabold text-slate-300 tracking-wider">
                  {selectedObject.type} Object Inspector
                </div>

                <TransformPanel />

                {selectedObject.type === "text" && (
                  <TextProperties object={selectedObject as TextObject} />
                )}

                {selectedObject.type === "shape" && (
                  <ShapeProperties object={selectedObject as ShapeObject} />
                )}

                {selectedObject.type === "image" && (
                  <div className="space-y-4">
                    <ImageProperties object={selectedObject as ImageObject} />
                    <div className="pt-3 border-t border-slate-800">
                      <div className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-2">
                        Photo Adjustments
                      </div>
                      {renderLightroomDevelopSections()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DocumentProperties />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
