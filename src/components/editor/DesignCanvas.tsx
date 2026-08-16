"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { EditorObject, ImageObject, TextObject, ShapeObject } from "@/types/design";
import { ImageRenderer } from "@/lib/image/renderer";
import { CanvasOverlays } from "./CanvasOverlays";
import { Rulers } from "./Rulers";
import { CropOverlay } from "./CropOverlay";
import { ContextMenu } from "./ContextMenu";

interface SmartGuide {
  type: "x" | "y";
  pos: number;
}

export function DesignCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const objects = useEditorStore((s) => s.objects);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const documentPreset = useEditorStore((s) => s.documentPreset);
  const activeTool = useEditorStore((s) => s.activeTool);
  const cropState = useEditorStore((s) => s.cropState);
  const zoom = useEditorStore((s) => s.zoom);
  const pan = useEditorStore((s) => s.pan);
  const adjustments = useEditorStore((s) => s.adjustments);
  const isBeforeAfter = useEditorStore((s) => s.isBeforeAfter);
  const grid = useEditorStore((s) => s.grid);

  const setSelectedObjectIds = useEditorStore((s) => s.setSelectedObjectIds);
  const toggleObjectSelection = useEditorStore((s) => s.toggleObjectSelection);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const updateObject = useEditorStore((s) => s.updateObject);
  const updateObjects = useEditorStore((s) => s.updateObjects);
  const setPan = useEditorStore((s) => s.setPan);
  const commitHistorySnapshot = useEditorStore((s) => s.commitHistorySnapshot);
  const moveSelectedObjectsByArrow = useEditorStore((s) => s.moveSelectedObjectsByArrow);
  const copySelectedObjects = useEditorStore((s) => s.copySelectedObjects);
  const pasteObjects = useEditorStore((s) => s.pasteObjects);
  const cutSelectedObjects = useEditorStore((s) => s.cutSelectedObjects);
  const duplicateSelectedObjects = useEditorStore((s) => s.duplicateSelectedObjects);
  const deleteSelectedObjects = useEditorStore((s) => s.deleteSelectedObjects);
  const startCrop = useEditorStore((s) => s.startCrop);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);

  const [dragState, setDragState] = useState<{
    type: "move" | "resize" | "rotate" | "pan" | "selectBox";
    handle?: string;
    startX: number;
    startY: number;
    initialObjects: Record<string, { x: number; y: number; w: number; h: number; r: number }>;
    startPan: { x: number; y: number };
    selectBoxStart?: { x: number; y: number };
  } | null>(null);

  const [selectBox, setSelectBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [guides, setGuides] = useState<SmartGuide[]>([]);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const primaryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<ImageRenderer | null>(null);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveSelectedObjectsByArrow(e.shiftKey ? -10 : -1, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveSelectedObjectsByArrow(e.shiftKey ? 10 : 1, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelectedObjectsByArrow(0, e.shiftKey ? -10 : -1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelectedObjectsByArrow(0, e.shiftKey ? 10 : 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copySelectedObjects();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteObjects();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
        e.preventDefault();
        cutSelectedObjects();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelectedObjects();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedObjects();
      } else if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey) {
        startCrop();
      } else if (e.key.toLowerCase() === "g" && !e.ctrlKey && !e.metaKey) {
        toggleGrid();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    moveSelectedObjectsByArrow,
    copySelectedObjects,
    pasteObjects,
    cutSelectedObjects,
    duplicateSelectedObjects,
    deleteSelectedObjects,
    startCrop,
    toggleGrid,
  ]);

  // Initialize renderer for primary photo adjustments
  useEffect(() => {
    rendererRef.current = new ImageRenderer();
    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  const primaryObj = objects.find((o) => o.id === "primary_photo") as ImageObject | undefined;
  const primarySrc = primaryObj?.src;
  const primaryW = primaryObj?.width;
  const primaryH = primaryObj?.height;

  const primaryImgRef = useRef<HTMLImageElement | null>(null);

  // Preload primary photo image element on src change
  useEffect(() => {
    if (!primarySrc) {
      primaryImgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = primarySrc;
    img.onload = () => {
      primaryImgRef.current = img;
      renderPrimaryPhoto();
    };
  }, [primarySrc]);

  // Render primary photo on canvas cleanly without wiping canvas context on position (x, y) drag
  const renderPrimaryPhoto = useCallback(() => {
    const img = primaryImgRef.current;
    if (!primaryW || !primaryH || !primaryCanvasRef.current || !rendererRef.current || !img) return;
    const canvas = primaryCanvasRef.current;
    if (canvas.width !== primaryW || canvas.height !== primaryH) {
      canvas.width = primaryW;
      canvas.height = primaryH;
    }

    rendererRef.current.render({
      img,
      targetCanvas: canvas,
      adjustments: primaryObj?.adjustments || adjustments,
      zoom: 100,
      pan: { x: 0, y: 0 },
      isBeforeMode: isBeforeAfter,
    });
  }, [primaryW, primaryH, adjustments, isBeforeAfter, primaryObj?.adjustments]);

  useEffect(() => {
    renderPrimaryPhoto();
  }, [renderPrimaryPhoto]);

  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 1000, h: 700 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    };
    updateSize();
    const obs = new ResizeObserver(updateSize);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const docW = documentPreset.width;
  const docH = documentPreset.height;

  // Auto-fit document inside viewport space with padding so ratio is always perfect
  const margin = 80;
  const availW = Math.max(200, containerSize.w - margin);
  const availH = Math.max(200, containerSize.h - margin);

  const fitScale = Math.min(availW / docW, availH / docH);
  const scale = (zoom / 100) * fitScale;

  // Handle Right-click Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Handle pointer down on background
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (contextMenuPos) setContextMenuPos(null);

    if (e.target !== containerRef.current && (e.target as HTMLElement).id !== "design_workspace_bg") {
      return;
    }
    if (e.button !== 0) return;

    if (e.shiftKey) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const startX = (e.clientX - rect.left - pan.x) / scale;
      const startY = (e.clientY - rect.top - pan.y) / scale;

      setDragState({
        type: "selectBox",
        startX: e.clientX,
        startY: e.clientY,
        initialObjects: {},
        startPan: pan,
        selectBoxStart: { x: startX, y: startY },
      });
    } else {
      clearSelection();
      setDragState({
        type: "pan",
        startX: e.clientX,
        startY: e.clientY,
        initialObjects: {},
        startPan: pan,
      });
    }
  };

  // Handle pointer down on an object
  const handleObjectPointerDown = (obj: EditorObject, e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    if (contextMenuPos) setContextMenuPos(null);
    if (obj.locked) return;

    if (e.shiftKey) {
      toggleObjectSelection(obj.id);
    } else {
      if (!selectedObjectIds.includes(obj.id)) {
        setSelectedObjectIds([obj.id]);
      }
    }

    const initMap: Record<string, { x: number; y: number; w: number; h: number; r: number }> = {};
    const idsToMove = selectedObjectIds.includes(obj.id) ? selectedObjectIds : [obj.id];

    idsToMove.forEach((id) => {
      const o = objects.find((item) => item.id === id);
      if (o) {
        initMap[id] = { x: o.x, y: o.y, w: o.width, h: o.height, r: o.rotation };
      }
    });

    setDragState({
      type: "move",
      startX: e.clientX,
      startY: e.clientY,
      initialObjects: initMap,
      startPan: pan,
    });
  };

  // Handle pointer down on a resize handle
  const handleHandlePointerDown = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    if (selectedObjectIds.length === 0) return;

    const initMap: Record<string, { x: number; y: number; w: number; h: number; r: number }> = {};
    selectedObjectIds.forEach((id) => {
      const o = objects.find((item) => item.id === id);
      if (o) {
        initMap[id] = { x: o.x, y: o.y, w: o.width, h: o.height, r: o.rotation };
      }
    });

    setDragState({
      type: handle === "rotate" ? "rotate" : "resize",
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialObjects: initMap,
      startPan: pan,
    });
  };

  // Handle pointer move during drag
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;

    if (dragState.type === "pan") {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      setPan({ x: dragState.startPan.x + dx, y: dragState.startPan.y + dy });
      return;
    }

    if (dragState.type === "selectBox" && dragState.selectBoxStart && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - pan.x) / scale;
      const currentY = (e.clientY - rect.top - pan.y) / scale;

      const x = Math.min(dragState.selectBoxStart.x, currentX);
      const y = Math.min(dragState.selectBoxStart.y, currentY);
      const w = Math.abs(currentX - dragState.selectBoxStart.x);
      const h = Math.abs(currentY - dragState.selectBoxStart.y);

      setSelectBox({ x, y, w, h });

      const intersected = objects.filter(
        (o) => o.x + o.width >= x && o.x <= x + w && o.y + o.height >= y && o.y <= y + h
      );
      setSelectedObjectIds(intersected.map((o) => o.id));
      return;
    }

    const dx = (e.clientX - dragState.startX) / scale;
    const dy = (e.clientY - dragState.startY) / scale;

    if (dragState.type === "move") {
      const newGuides: SmartGuide[] = [];
      const primaryId = selectedObjectIds[0];
      const primaryInit = dragState.initialObjects[primaryId];
      if (!primaryInit) return;

      let newX = primaryInit.x + dx;
      let newY = primaryInit.y + dy;

      // Smart Guides & Grid Snapping
      if (grid.visible && grid.snap) {
        newX = Math.round(newX / grid.size) * grid.size;
        newY = Math.round(newY / grid.size) * grid.size;
      } else {
        const snapThreshold = 6;
        const centerX = docW / 2;
        const centerY = docH / 2;

        if (Math.abs(newX + primaryInit.w / 2 - centerX) < snapThreshold) {
          newX = centerX - primaryInit.w / 2;
          newGuides.push({ type: "x", pos: centerX });
        }
        if (Math.abs(newY + primaryInit.h / 2 - centerY) < snapThreshold) {
          newY = centerY - primaryInit.h / 2;
          newGuides.push({ type: "y", pos: centerY });
        }
      }

      setGuides(newGuides);

      const deltaX = newX - primaryInit.x;
      const deltaY = newY - primaryInit.y;

      const updatesMap: Record<string, Partial<EditorObject>> = {};
      Object.keys(dragState.initialObjects).forEach((id) => {
        const init = dragState.initialObjects[id];
        updatesMap[id] = { x: Math.round(init.x + deltaX), y: Math.round(init.y + deltaY) };
      });
      updateObjects(updatesMap);
    } else if (dragState.type === "resize" && dragState.handle) {
      const handle = dragState.handle;
      const updatesMap: Record<string, Partial<EditorObject>> = {};

      Object.keys(dragState.initialObjects).forEach((id) => {
        const init = dragState.initialObjects[id];
        let newW = init.w;
        let newH = init.h;
        let newX = init.x;
        let newY = init.y;

        if (handle.includes("e")) newW = Math.max(20, init.w + dx);
        if (handle.includes("s")) newH = Math.max(20, init.h + dy);
        if (handle.includes("w")) {
          const w = Math.max(20, init.w - dx);
          newX = init.x + (init.w - w);
          newW = w;
        }
        if (handle.includes("n")) {
          const h = Math.max(20, init.h - dy);
          newY = init.y + (init.h - h);
          newH = h;
        }

        if (e.shiftKey) {
          const ratio = init.w / init.h;
          newH = newW / ratio;
        }

        updatesMap[id] = {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        };
      });
      updateObjects(updatesMap);
    } else if (dragState.type === "rotate") {
      const primaryId = selectedObjectIds[0];
      const primaryInit = dragState.initialObjects[primaryId];
      if (!primaryInit) return;

      const centerObjX = primaryInit.x + primaryInit.w / 2;
      const centerObjY = primaryInit.y + primaryInit.h / 2;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = (e.clientX - rect.left - pan.x) / scale;
      const mouseY = (e.clientY - rect.top - pan.y) / scale;

      let angle = Math.atan2(mouseY - centerObjY, mouseX - centerObjX) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      const snapAngles = [0, 45, 90, 135, 180, 270, 360];
      snapAngles.forEach((snap) => {
        if (Math.abs(angle - snap) < 5) angle = snap % 360;
      });

      updateObject(primaryId, { rotation: Math.round(angle) });
    }
  };

  const handlePointerUp = () => {
    if (dragState) {
      setDragState(null);
      setSelectBox(null);
      setGuides([]);
      commitHistorySnapshot();
    }
  };

  // Render object content
  const renderObjectContent = (obj: EditorObject) => {
    if (!obj.visible) return null;

    if (obj.type === "image") {
      const imgObj = obj as ImageObject;

      let borderRadius = "0px";
      if (imgObj.clipFrame === "rounded") borderRadius = "24px";
      if (imgObj.clipFrame === "circle") borderRadius = "50%";

      const flipTransform = `${imgObj.flipH ? "scaleX(-1)" : ""} ${imgObj.flipV ? "scaleY(-1)" : ""}`.trim();

      return (
        <div
          className="w-full h-full overflow-hidden pointer-events-none select-none"
          style={{ opacity: obj.opacity, borderRadius, transform: flipTransform || undefined }}
        >
          <img
            src={imgObj.src}
            alt={obj.name}
            draggable={false}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        </div>
      );
    }

    if (obj.type === "text") {
      const txt = obj as TextObject;
      return (
        <div
          className="w-full h-full flex items-center select-none"
          style={{
            opacity: obj.opacity,
            fontFamily: txt.fontFamily,
            fontSize: `${txt.fontSize}px`,
            fontWeight: txt.fontWeight,
            color: txt.color,
            textAlign: txt.textAlign,
            justifyContent:
              txt.textAlign === "center"
                ? "center"
                : txt.textAlign === "right"
                ? "flex-end"
                : "flex-start",
            letterSpacing: `${txt.letterSpacing}px`,
            lineHeight: txt.lineHeight,
            fontStyle: txt.italic ? "italic" : "normal",
            textDecoration: txt.underline ? "underline" : "none",
            textShadow: `${txt.shadowOffsetX}px ${txt.shadowOffsetY}px ${txt.shadowBlur}px ${txt.shadowColor}`,
          }}
        >
          {txt.text}
        </div>
      );
    }

    if (obj.type === "shape") {
      const shape = obj as ShapeObject;
      const fillStyle = shape.gradientFill
        ? `${shape.gradientFill.type}-gradient(${shape.gradientFill.angle}deg, ${shape.gradientFill.color1}, ${shape.gradientFill.color2})`
        : shape.fill;

      if (shape.shapeType === "rectangle" || shape.shapeType === "rounded-rectangle") {
        return (
          <div
            className="w-full h-full"
            style={{
              background: fillStyle,
              border: `${shape.strokeWidth}px solid ${shape.stroke}`,
              borderRadius: `${shape.cornerRadius}px`,
              opacity: shape.opacity,
            }}
          />
        );
      }

      if (shape.shapeType === "circle") {
        return (
          <div
            className="w-full h-full rounded-full"
            style={{
              background: fillStyle,
              border: `${shape.strokeWidth}px solid ${shape.stroke}`,
              opacity: shape.opacity,
            }}
          />
        );
      }

      return (
        <svg className="w-full h-full overflow-visible" style={{ opacity: shape.opacity }}>
          {shape.shapeType === "triangle" && (
            <polygon
              points={`0,${shape.height} ${shape.width / 2},0 ${shape.width},${shape.height}`}
              fill={shape.fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          )}
          {shape.shapeType === "star" && (
            <polygon
              points={`${shape.width * 0.5},0 ${shape.width * 0.63},${shape.height * 0.38} ${shape.width},${shape.height * 0.38} ${shape.width * 0.7},${shape.height * 0.6} ${shape.width * 0.82},${shape.height} ${shape.width * 0.5},${shape.height * 0.75} ${shape.width * 0.18},${shape.height} ${shape.width * 0.3},${shape.height * 0.6} 0,${shape.height * 0.38} ${shape.width * 0.37},${shape.height * 0.38}`}
              fill={shape.fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          )}
        </svg>
      );
    }

    return null;
  };

  const sortedObjects = objects.filter((o) => o.id !== "primary_photo").sort((a, b) => a.zIndex - b.zIndex);
  const isCropActive = activeTool === "crop" || cropState.active;

  return (
    <div
      ref={containerRef}
      id="design_workspace_bg"
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{ backgroundColor: "var(--editor-canvas)" }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      {/* Canvas Document Surface Container */}
      <div
        className="relative shadow-2xl transition-all"
        style={{
          width: `${docW}px`,
          height: `${docH}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Rulers Overlay */}
        <Rulers />

        {/* Canvas Overlays (Background, Grid, Safe Area, Manual Guides) */}
        <CanvasOverlays />

        {/* Render Objects in z-order */}
        {sortedObjects.map((obj) => {
          const isSelected = selectedObjectIds.includes(obj.id);
          return (
            <div
              key={obj.id}
              className="absolute group z-10"
              style={{
                left: `${obj.x}px`,
                top: `${obj.y}px`,
                width: `${obj.width}px`,
                height: `${obj.height}px`,
                transform: `rotate(${obj.rotation}deg)`,
                willChange: "left, top, transform",
                cursor: obj.locked ? "not-allowed" : "move",
              }}
              onPointerDown={(e) => handleObjectPointerDown(obj, e)}
            >
              {renderObjectContent(obj)}

              {/* Selection Bounding Box & Transformation Handles */}
              {isSelected && !obj.locked && !isCropActive && (
                <div className="absolute -inset-0.5 border-2 border-slate-500 pointer-events-none z-20">
                  {/* Rotation handle */}
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-slate-500 rounded-full cursor-grab pointer-events-auto flex items-center justify-center shadow-md"
                    onPointerDown={(e) => handleHandlePointerDown("rotate", e)}
                  >
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                  </div>

                  {/* Corner Resize Handles */}
                  <div
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-nwse-resize pointer-events-auto shadow"
                    onPointerDown={(e) => handleHandlePointerDown("nw", e)}
                  />
                  <div
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-nesw-resize pointer-events-auto shadow"
                    onPointerDown={(e) => handleHandlePointerDown("ne", e)}
                  />
                  <div
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-nesw-resize pointer-events-auto shadow"
                    onPointerDown={(e) => handleHandlePointerDown("sw", e)}
                  />
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-nwse-resize pointer-events-auto shadow"
                    onPointerDown={(e) => handleHandlePointerDown("se", e)}
                  />

                  {/* Edge Handles */}
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-ns-resize pointer-events-auto shadow"
                    onPointerDown={(e) => handleHandlePointerDown("n", e)}
                  />
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-ns-resize pointer-events-auto shadow"
                    onPointerDown={(e) => handleHandlePointerDown("s", e)}
                  />
                  <div
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-ew-resize pointer-events-auto shadow"
                    onPointerDown={(e) => handleHandlePointerDown("w", e)}
                  />
                  <div
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-500 rounded-sm cursor-ew-resize pointer-events-auto shadow"
                    onPointerDown={(e) => handleHandlePointerDown("e", e)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Smart Guides Overlay */}
        {guides.map((g, idx) => (
          <div
            key={idx}
            className="absolute bg-pink-500 pointer-events-none z-30 opacity-80"
            style={
              g.type === "x"
                ? { left: `${g.pos}px`, top: 0, width: "1px", height: "100%" }
                : { top: `${g.pos}px`, left: 0, height: "1px", width: "100%" }
            }
          />
        ))}

        {/* Drag Select Box Overlay */}
        {selectBox && (
          <div
            className="absolute border border-slate-500 bg-slate-500/20 pointer-events-none z-30"
            style={{
              left: `${selectBox.x}px`,
              top: `${selectBox.y}px`,
              width: `${selectBox.w}px`,
              height: `${selectBox.h}px`,
            }}
          />
        )}

        {/* Interactive Crop Engine Overlay */}
        {isCropActive && <CropOverlay />}
      </div>

      {/* Context Menu Popup */}
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </div>
  );
}

