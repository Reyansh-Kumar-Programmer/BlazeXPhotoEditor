"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";

interface AdjustmentSectionProps {
  title: string;
  defaultExpanded?: boolean;
  onResetSection?: () => void;
  hasChanges?: boolean;
  disabled?: boolean;
  disabledBadgeText?: string;
  children: React.ReactNode;
}

export function AdjustmentSection({
  title,
  defaultExpanded = true,
  onResetSection,
  hasChanges = false,
  disabled = false,
  disabledBadgeText,
  children,
}: AdjustmentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <div style={{ borderBottom: "1px solid var(--editor-border-subtle)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 select-none transition-colors rounded-sm cursor-pointer"
        onClick={() => setIsExpanded((p) => !p)}
        style={{ color: "var(--editor-fg)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--editor-panel-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent";
        }}
      >
        <div className="flex items-center gap-2 text-left flex-1 font-semibold text-[11px] tracking-tight">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 shrink-0" style={{ color: "var(--editor-muted)" }} />
          ) : (
            <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "var(--editor-muted)" }} />
          )}
          <span>{title}</span>
          {hasChanges && (
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: isDark ? "#60a5fa" : "#2563eb" }}
            />
          )}
          {disabledBadgeText && (
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded font-normal"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                color: "var(--editor-muted)",
              }}
            >
              {disabledBadgeText}
            </span>
          )}
        </div>

        {hasChanges && onResetSection && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onResetSection();
            }}
            title={`Reset ${title}`}
            className="p-1 rounded transition-colors"
            style={{ color: "var(--editor-muted)" }}
          >
            <RotateCcw className="w-2.5 h-2.5 stroke-[2.2]" />
          </button>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          className={`px-3 pb-2 pt-0.5 space-y-0 ${disabled ? "opacity-40 pointer-events-none" : ""}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
