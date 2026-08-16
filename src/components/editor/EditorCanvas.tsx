"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { ImageRenderer } from "@/lib/image/renderer";

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<ImageRenderer | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const image = useEditorStore((s) => s.image);
  const adjustments = useEditorStore((s) => s.adjustments);
  const zoom = useEditorStore((s) => s.zoom);
  const pan = useEditorStore((s) => s.pan);
  const isBeforeAfter = useEditorStore((s) => s.isBeforeAfter);
  const setPan = useEditorStore((s) => s.setPan);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setHistogramData = useEditorStore((s) => s.setHistogramData);
  const setIsProcessing = useEditorStore((s) => s.setIsProcessing);
  const toggleBeforeAfter = useEditorStore((s) => s.toggleBeforeAfter);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  // Persistent renderer
  useEffect(() => {
    rendererRef.current = new ImageRenderer();
    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  // Pre-load image element once URL changes
  useEffect(() => {
    if (!image.isLoaded || !image.imageUrl) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.imageUrl;
    img.onload = () => {
      imgRef.current = img;
    };
  }, [image.isLoaded, image.imageUrl]);

  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  const triggerRender = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || !rendererRef.current) return;

    rendererRef.current.render({
      img,
      targetCanvas: canvas,
      adjustments,
      zoom,
      pan,
      isBeforeMode: isBeforeAfter,
      onHistogramUpdate: (data) => setHistogramData(data),
      onProcessingChange: (proc) => setIsProcessing(proc),
    });
  }, [adjustments, zoom, pan, isBeforeAfter, setHistogramData, setIsProcessing]);

  // Render when state or dimensions change
  useEffect(() => {
    updateCanvasDimensions();
    const id = setTimeout(triggerRender, 10);
    return () => clearTimeout(id);
  }, [updateCanvasDimensions, triggerRender, image.imageUrl]);

  // ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(() => {
      updateCanvasDimensions();
      triggerRender();
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, [updateCanvasDimensions, triggerRender]);

  // Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Scroll zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 15 : -15;
      setZoom((prev) => Math.min(400, Math.max(25, prev + delta)));
    },
    [setZoom]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Keyboard shortcuts (global)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;

      const store = useEditorStore.getState();

      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        toggleBeforeAfter();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        store.resetZoom();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        store.zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        store.zoomOut();
      } else if (e.key === "r" || e.key === "R") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          store.resetAllAdjustments();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggleBeforeAfter, undo, redo]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{ backgroundColor: "var(--editor-canvas)" }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      />
    </div>
  );
}
