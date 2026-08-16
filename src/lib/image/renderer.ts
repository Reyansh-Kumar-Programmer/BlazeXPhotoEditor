import { EditorAdjustments } from "@/types/editor";
import { applyAdjustments } from "./adjustments";
import { calculateHistogram } from "./histogram";

export interface RenderParams {
  img: HTMLImageElement;
  targetCanvas: HTMLCanvasElement;
  adjustments: EditorAdjustments;
  zoom: number;
  pan: { x: number; y: number };
  isBeforeMode?: boolean;
  onHistogramUpdate?: (data: ReturnType<typeof calculateHistogram>) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

export class ImageRenderer {
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | null;
  private animationFrameId: number | null = null;
  private lastImgSrc: string | null = null;
  private cachedSourceImageData: ImageData | null = null;

  constructor() {
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCtx = this.offscreenCanvas.getContext("2d", {
      willReadFrequently: true,
    });
  }

  public render(params: RenderParams): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(() => {
      this.executeRender(params);
    });
  }

  public renderSync(params: RenderParams): void {
    this.executeRender(params);
  }

  public renderExport(
    img: HTMLImageElement,
    targetCanvas: HTMLCanvasElement,
    adjustments: EditorAdjustments,
    isBeforeMode: boolean = false
  ): void {
    if (!img || !targetCanvas) return;
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;
    if (naturalWidth === 0 || naturalHeight === 0) return;

    this.offscreenCanvas.width = naturalWidth;
    this.offscreenCanvas.height = naturalHeight;
    if (this.offscreenCtx) {
      this.offscreenCtx.clearRect(0, 0, naturalWidth, naturalHeight);
      this.offscreenCtx.drawImage(img, 0, 0);
      const sourceData = this.offscreenCtx.getImageData(0, 0, naturalWidth, naturalHeight);
      const workingData = new ImageData(
        new Uint8ClampedArray(sourceData.data),
        naturalWidth,
        naturalHeight
      );
      const processed = applyAdjustments(workingData, adjustments, isBeforeMode);
      this.offscreenCtx.putImageData(processed, 0, 0);
    }

    targetCanvas.width = naturalWidth;
    targetCanvas.height = naturalHeight;
    const ctx = targetCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, naturalWidth, naturalHeight);
      ctx.drawImage(this.offscreenCanvas, 0, 0, naturalWidth, naturalHeight);
    }
  }

  private executeRender(params: RenderParams): void {
    const {
      img, targetCanvas, adjustments, zoom, pan,
      isBeforeMode = false, onHistogramUpdate, onProcessingChange,
    } = params;

    if (!img || !img.complete || !targetCanvas) return;
    if (onProcessingChange) onProcessingChange(true);

    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;
    if (naturalWidth === 0 || naturalHeight === 0) return;

    // Cache source image data
    if (this.lastImgSrc !== img.src || !this.cachedSourceImageData) {
      this.offscreenCanvas.width = naturalWidth;
      this.offscreenCanvas.height = naturalHeight;
      if (this.offscreenCtx) {
        this.offscreenCtx.clearRect(0, 0, naturalWidth, naturalHeight);
        this.offscreenCtx.drawImage(img, 0, 0);
        this.cachedSourceImageData = this.offscreenCtx.getImageData(0, 0, naturalWidth, naturalHeight);
      }
      this.lastImgSrc = img.src;
    }

    if (!this.cachedSourceImageData || !this.offscreenCtx) return;

    // Apply adjustments
    const workingData = new ImageData(
      new Uint8ClampedArray(this.cachedSourceImageData.data),
      naturalWidth, naturalHeight
    );
    const processed = applyAdjustments(workingData, adjustments, isBeforeMode);

    if (onHistogramUpdate) {
      onHistogramUpdate(calculateHistogram(processed));
    }

    this.offscreenCtx.putImageData(processed, 0, 0);

    // Draw to target canvas
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;

    // The target canvas may be DPR-scaled; use CSS pixel dimensions for layout math
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const viewW = targetCanvas.width / dpr;
    const viewH = targetCanvas.height / dpr;

    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    const fitScale = Math.min(viewW / naturalWidth, viewH / naturalHeight);
    const totalScale = fitScale * (zoom / 100);
    const scaledW = naturalWidth * totalScale;
    const scaledH = naturalHeight * totalScale;

    const x = (viewW - scaledW) / 2 + pan.x;
    const y = (viewH - scaledH) / 2 + pan.y;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = zoom > 100 ? "medium" : "high";
    ctx.drawImage(this.offscreenCanvas, x, y, scaledW, scaledH);

    if (onProcessingChange) onProcessingChange(false);
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.cachedSourceImageData = null;
    this.lastImgSrc = null;
  }
}
