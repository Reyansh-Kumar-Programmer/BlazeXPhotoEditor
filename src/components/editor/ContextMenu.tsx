"use client";

import React, { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";
import {
  Copy,
  Scissors,
  Clipboard,
  CopyPlus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  FolderPlus,
  FolderMinus,
  Lock,
  Unlock,
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const objects = useEditorStore((s) => s.objects);
  const clipboard = useEditorStore((s) => s.clipboard);

  const copySelectedObjects = useEditorStore((s) => s.copySelectedObjects);
  const pasteObjects = useEditorStore((s) => s.pasteObjects);
  const cutSelectedObjects = useEditorStore((s) => s.cutSelectedObjects);
  const duplicateSelectedObjects = useEditorStore((s) => s.duplicateSelectedObjects);
  const deleteSelectedObjects = useEditorStore((s) => s.deleteSelectedObjects);
  const reorderObject = useEditorStore((s) => s.reorderObject);
  const groupSelectedObjects = useEditorStore((s) => s.groupSelectedObjects);
  const ungroupSelectedObjects = useEditorStore((s) => s.ungroupSelectedObjects);
  const updateObject = useEditorStore((s) => s.updateObject);
  const alignSelectedObjects = useEditorStore((s) => s.alignSelectedObjects);

  const selectedObjects = objects.filter((o) => selectedObjectIds.includes(o.id));
  const primarySelected = selectedObjects[0];
  const isGroup = primarySelected && primarySelected.type === "group";
  const isLocked = primarySelected && primarySelected.locked;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  // Clamp popup within screen dimensions
  const posX = typeof window !== "undefined" ? Math.min(x, window.innerWidth - 210) : x;
  const posY = typeof window !== "undefined" ? Math.min(y, window.innerHeight - 340) : y;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-slate-950/95 text-slate-200 border border-slate-700/80 rounded-lg shadow-2xl py-1.5 min-w-[200px] text-xs backdrop-blur-md select-none"
      style={{ left: `${Math.max(10, posX)}px`, top: `${Math.max(10, posY)}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cut / Copy / Paste / Duplicate */}
      <button
        type="button"
        disabled={selectedObjectIds.length === 0}
        onClick={() => handleAction(cutSelectedObjects)}
        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <span className="flex items-center gap-2">
          <Scissors className="w-3.5 h-3.5" /> Cut
        </span>
        <span className="text-[10px] font-mono opacity-60">Ctrl+X</span>
      </button>

      <button
        type="button"
        disabled={selectedObjectIds.length === 0}
        onClick={() => handleAction(copySelectedObjects)}
        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <span className="flex items-center gap-2">
          <Copy className="w-3.5 h-3.5" /> Copy
        </span>
        <span className="text-[10px] font-mono opacity-60">Ctrl+C</span>
      </button>

      <button
        type="button"
        disabled={clipboard.length === 0}
        onClick={() => handleAction(pasteObjects)}
        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <span className="flex items-center gap-2">
          <Clipboard className="w-3.5 h-3.5" /> Paste
        </span>
        <span className="text-[10px] font-mono opacity-60">Ctrl+V</span>
      </button>

      <button
        type="button"
        disabled={selectedObjectIds.length === 0}
        onClick={() => handleAction(duplicateSelectedObjects)}
        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <span className="flex items-center gap-2">
          <CopyPlus className="w-3.5 h-3.5" /> Duplicate
        </span>
        <span className="text-[10px] font-mono opacity-60">Ctrl+D</span>
      </button>

      <button
        type="button"
        disabled={selectedObjectIds.length === 0}
        onClick={() => handleAction(deleteSelectedObjects)}
        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-red-950/80 hover:text-red-200 text-red-400 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <span className="flex items-center gap-2">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </span>
        <span className="text-[10px] font-mono opacity-60">Del</span>
      </button>

      <div className="my-1 border-t border-slate-800" />

      {/* Layer Ordering */}
      {selectedObjectIds.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => handleAction(() => reorderObject(primarySelected.id, "top"))}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
          >
            <ArrowUpToLine className="w-3.5 h-3.5" /> Bring to Front
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => reorderObject(primarySelected.id, "up"))}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
          >
            <ArrowUp className="w-3.5 h-3.5" /> Bring Forward
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => reorderObject(primarySelected.id, "down"))}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
          >
            <ArrowDown className="w-3.5 h-3.5" /> Send Backward
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => reorderObject(primarySelected.id, "bottom"))}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" /> Send to Back
          </button>
          <div className="my-1 border-t border-slate-800" />
        </>
      )}

      {/* Group / Ungroup / Lock / Unlock */}
      {selectedObjectIds.length >= 2 && (
        <button
          type="button"
          onClick={() => handleAction(groupSelectedObjects)}
          className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
        >
          <FolderPlus className="w-3.5 h-3.5" /> Group Objects
        </button>
      )}

      {isGroup && (
        <button
          type="button"
          onClick={() => handleAction(ungroupSelectedObjects)}
          className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
        >
          <FolderMinus className="w-3.5 h-3.5" /> Ungroup
        </button>
      )}

      {primarySelected && (
        <button
          type="button"
          onClick={() =>
            handleAction(() => updateObject(primarySelected.id, { locked: !isLocked }))
          }
          className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
        >
          {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {isLocked ? "Unlock Object" : "Lock Object"}
        </button>
      )}

      {selectedObjectIds.length > 0 && (
        <>
          <div className="my-1 border-t border-slate-800" />
          <button
            type="button"
            onClick={() => handleAction(() => alignSelectedObjects("canvasCenter"))}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
          >
            <AlignCenter className="w-3.5 h-3.5" /> Center on Canvas
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => alignSelectedObjects("canvasLeft"))}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
          >
            <AlignLeft className="w-3.5 h-3.5" /> Align Left on Canvas
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => alignSelectedObjects("canvasRight"))}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
          >
            <AlignRight className="w-3.5 h-3.5" /> Align Right on Canvas
          </button>
        </>
      )}
    </div>
  );
}
