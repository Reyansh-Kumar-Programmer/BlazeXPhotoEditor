"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { EditorObject } from "@/types/design";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Layers,
  Image as ImageIcon,
  Type,
  Square,
  Group,
} from "lucide-react";

export function LayersPanel() {
  const objects = useEditorStore((s) => s.objects);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const setSelectedObjectIds = useEditorStore((s) => s.setSelectedObjectIds);
  const updateObject = useEditorStore((s) => s.updateObject);
  const reorderObject = useEditorStore((s) => s.reorderObject);
  const deleteSelectedObjects = useEditorStore((s) => s.deleteSelectedObjects);
  const duplicateSelectedObjects = useEditorStore((s) => s.duplicateSelectedObjects);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Sort objects so topmost layer appears at top of panel list
  const sortedObjects = [...objects].sort((a, b) => b.zIndex - a.zIndex);

  const getObjectIcon = (obj: EditorObject) => {
    switch (obj.type) {
      case "image":
        return <ImageIcon className="w-3.5 h-3.5 text-slate-200" />;
      case "text":
        return <Type className="w-3.5 h-3.5 text-emerald-400" />;
      case "shape":
        return <Square className="w-3.5 h-3.5 text-purple-400" />;
      case "group":
        return <Group className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const handleStartRename = (obj: EditorObject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(obj.id);
    setEditingName(obj.name);
  };

  const handleFinishRename = (id: string) => {
    if (editingName.trim()) {
      updateObject(id, { name: editingName.trim() });
      commitHistorySnapshot();
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-slate-400">
          <Layers className="w-3.5 h-3.5" />
          <span>Layers ({objects.length})</span>
        </div>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
        {sortedObjects.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic">
            No design layers yet
          </div>
        ) : (
          sortedObjects.map((obj) => {
            const isSelected = selectedObjectIds.includes(obj.id);
            return (
              <div
                key={obj.id}
                onClick={() => setSelectedObjectIds([obj.id])}
                className={`group flex items-center justify-between p-1.5 rounded text-xs transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-slate-800 border-slate-500 text-white"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                {/* Left Layer Info */}
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  {getObjectIcon(obj)}
                  {editingId === obj.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleFinishRename(obj.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFinishRename(obj.id);
                      }}
                      autoFocus
                      className="bg-slate-950 px-1 py-0.5 rounded text-xs text-white outline-none w-full border border-slate-500"
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => handleStartRename(obj, e)}
                      className="truncate text-[11px] font-medium"
                    >
                      {obj.name}
                    </span>
                  )}
                </div>

                {/* Right Quick Controls */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateObject(obj.id, { visible: !obj.visible });
                      commitHistorySnapshot();
                    }}
                    title={obj.visible ? "Hide Layer" : "Show Layer"}
                    className="p-1 hover:text-white"
                  >
                    {obj.visible ? <Eye className="w-3 h-3 text-slate-400" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateObject(obj.id, { locked: !obj.locked });
                      commitHistorySnapshot();
                    }}
                    title={obj.locked ? "Unlock Layer" : "Lock Layer"}
                    className="p-1 hover:text-white"
                  >
                    {obj.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                  </button>

                  {isSelected && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderObject(obj.id, "up");
                        }}
                        title="Move Up"
                        className="p-1 hover:text-white text-slate-400"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderObject(obj.id, "down");
                        }}
                        title="Move Down"
                        className="p-1 hover:text-white text-slate-400"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
