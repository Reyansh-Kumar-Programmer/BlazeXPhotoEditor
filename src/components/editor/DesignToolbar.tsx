"use client";

import React, { useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";
import {
  DOCUMENT_PRESETS,
  DesignTool,
  ShapeType,
  TextObject,
  ShapeObject,
  ImageObject,
} from "@/types/design";
import {
  MousePointer,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalSpaceAround,
  AlignHorizontalSpaceAround,
  Copy,
  Trash2,
  Group,
  Ungroup,
  Maximize2,
} from "lucide-react";

export function DesignToolbar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const documentPreset = useEditorStore((s) => s.documentPreset);
  const setDocumentPreset = useEditorStore((s) => s.setDocumentPreset);
  const addObject = useEditorStore((s) => s.addObject);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const duplicateSelectedObjects = useEditorStore((s) => s.duplicateSelectedObjects);
  const deleteSelectedObjects = useEditorStore((s) => s.deleteSelectedObjects);
  const groupSelectedObjects = useEditorStore((s) => s.groupSelectedObjects);
  const ungroupSelectedObjects = useEditorStore((s) => s.ungroupSelectedObjects);
  const alignSelectedObjects = useEditorStore((s) => s.alignSelectedObjects);
  const distributeSelectedObjects = useEditorStore((s) => s.distributeSelectedObjects);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddText = () => {
    const newText: TextObject = {
      id: `text_${Date.now()}`,
      name: "Text — Double click to edit",
      type: "text",
      x: documentPreset.width / 2 - 150,
      y: documentPreset.height / 2 - 25,
      width: 300,
      height: 50,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 10,
      groupId: null,
      text: "Double click to edit",
      fontFamily: "Inter, sans-serif",
      fontSize: 32,
      fontWeight: 600,
      color: "#ffffff",
      textAlign: "center",
      letterSpacing: 0,
      lineHeight: 1.2,
      italic: false,
      underline: false,
      shadowColor: "rgba(0,0,0,0.5)",
      shadowBlur: 4,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    };
    addObject(newText);
    setActiveTool("select");
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const newShape: ShapeObject = {
      id: `shape_${Date.now()}`,
      name: `Shape — ${shapeType}`,
      type: "shape",
      shapeType,
      x: documentPreset.width / 2 - 75,
      y: documentPreset.height / 2 - 75,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 5,
      groupId: null,
      fill: "#ffffff",
      stroke: "#000000",
      strokeWidth: 0,
      cornerRadius: shapeType === "rounded-rectangle" ? 16 : 0,
    };
    addObject(newShape);
    setActiveTool("select");
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      const newImg: ImageObject = {
        id: `img_${Date.now()}`,
        name: file.name,
        type: "image",
        src: url,
        x: documentPreset.width / 2 - 150,
        y: documentPreset.height / 2 - 150,
        width: 300,
        height: Math.round(300 * (img.height / img.width)),
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 8,
        groupId: null,
        clipFrame: "none",
        aspectRatio: img.width / img.height,
      };
      addObject(newImg);
      setActiveTool("select");
    };
  };

  const hasSelection = selectedObjectIds.length > 0;
  const multiSelection = selectedObjectIds.length > 1;

  return (
    <div
      className="h-10 px-3 flex items-center justify-between gap-3 shrink-0 select-none z-10"
      style={{
        backgroundColor: "var(--editor-panel)",
        borderBottom: "1px solid var(--editor-border)",
      }}
    >
      {/* Left Tool Picker */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTool("select")}
          title="Select Tool (V)"
          className={`p-1.5 rounded transition-all ${
            activeTool === "select" ? "bg-slate-700 text-white" : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleAddText}
          title="Add Text (T)"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-1 text-xs"
        >
          <Type className="w-4 h-4" />
          <span className="text-[11px] font-medium hidden sm:inline">Text</span>
        </button>

        {/* Shape Menu */}
        <div className="relative group flex items-center">
          <button
            type="button"
            onClick={() => handleAddShape("rectangle")}
            title="Add Shape (S)"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-1 text-xs"
          >
            <Square className="w-4 h-4" />
            <span className="text-[11px] font-medium hidden sm:inline">Shape</span>
          </button>
          <div className="absolute top-full left-0 mt-1 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 rounded shadow-xl p-1 z-30 min-w-[120px]">
            <button
              onClick={() => handleAddShape("rectangle")}
              className="flex items-center gap-2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded"
            >
              <Square className="w-3.5 h-3.5" /> Rectangle
            </button>
            <button
              onClick={() => handleAddShape("rounded-rectangle")}
              className="flex items-center gap-2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded"
            >
              <Square className="w-3.5 h-3.5 rounded" /> Rounded
            </button>
            <button
              onClick={() => handleAddShape("circle")}
              className="flex items-center gap-2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded"
            >
              <Circle className="w-3.5 h-3.5" /> Circle
            </button>
            <button
              onClick={() => handleAddShape("triangle")}
              className="flex items-center gap-2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded"
            >
              <Triangle className="w-3.5 h-3.5" /> Triangle
            </button>
            <button
              onClick={() => handleAddShape("star")}
              className="flex items-center gap-2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded"
            >
              <Star className="w-3.5 h-3.5" /> Star
            </button>
          </div>
        </div>

        {/* Add Image */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Add Image Object"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-1 text-xs"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[11px] font-medium hidden sm:inline">Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleAddImage}
          className="hidden"
        />
      </div>

      {/* Center Alignment & Actions Toolbar */}
      {hasSelection && (
        <div className="flex items-center gap-1 border-x border-slate-700/50 px-2">
          <button
            type="button"
            onClick={() => alignSelectedObjects("left")}
            title="Align Left"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignSelectedObjects("center")}
            title="Align Center"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignSelectedObjects("right")}
            title="Align Right"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignSelectedObjects("top")}
            title="Align Top"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignSelectedObjects("canvasCenter")}
            title="Center on Canvas"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {multiSelection && (
            <>
              <button
                type="button"
                onClick={() => distributeSelectedObjects("horizontal")}
                title="Distribute Horizontally"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <AlignHorizontalSpaceAround className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => distributeSelectedObjects("vertical")}
                title="Distribute Vertically"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <AlignVerticalSpaceAround className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={groupSelectedObjects}
                title="Group Objects (Ctrl+G)"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <Group className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={ungroupSelectedObjects}
                title="Ungroup Objects (Ctrl+Shift+G)"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <Ungroup className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={duplicateSelectedObjects}
            title="Duplicate (Ctrl+D)"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={deleteSelectedObjects}
            title="Delete (Delete)"
            className="p-1 rounded hover:bg-red-950 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Right Canvas Preset Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold hidden md:inline">
          Canvas Size
        </span>
        <select
          value={documentPreset.id}
          onChange={(e) => {
            const found = DOCUMENT_PRESETS.find((p) => p.id === e.target.value);
            if (found) setDocumentPreset(found);
          }}
          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-200 border border-slate-700 outline-none cursor-pointer"
        >
          {DOCUMENT_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
