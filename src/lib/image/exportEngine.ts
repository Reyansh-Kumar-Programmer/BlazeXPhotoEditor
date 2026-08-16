import { EditorObject, DocumentBackground, ImageObject, TextObject, ShapeObject, DocumentPreset } from "@/types/design";
import { EditorAdjustments } from "@/types/editor";
import { ImageRenderer } from "./renderer";

interface ExportOptions {
  format: "png" | "jpeg" | "webp";
  quality: number; // 0.1 to 1.0
  filename?: string;
}

export async function exportDesignCanvas(
  objects: EditorObject[],
  documentPreset: DocumentPreset,
  documentBackground: DocumentBackground,
  globalAdjustments: EditorAdjustments,
  options: ExportOptions
): Promise<void> {
  const width = documentPreset.width;
  const height = documentPreset.height;

  // 1. Create Offscreen Canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D context for export");

  // 2. Render Document Background
  if (documentBackground.type === "solid") {
    ctx.fillStyle = documentBackground.color || "#ffffff";
    ctx.fillRect(0, 0, width, height);
  } else if (documentBackground.type === "gradient") {
    const angle = ((documentBackground.angle || 90) * Math.PI) / 180;
    const x1 = width / 2 - (Math.cos(angle) * width) / 2;
    const y1 = height / 2 - (Math.sin(angle) * height) / 2;
    const x2 = width / 2 + (Math.cos(angle) * width) / 2;
    const y2 = height / 2 + (Math.sin(angle) * height) / 2;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, documentBackground.color || "#ffffff");
    gradient.addColorStop(1, documentBackground.color2 || "#3b82f6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  // transparent background leaves canvas clear

  // 3. Sort objects by zIndex (excluding Develop mode primary photo)
  const sortedObjects = objects.filter((o) => o.id !== "primary_photo").sort((a, b) => a.zIndex - b.zIndex);

  const renderer = new ImageRenderer();

  // 4. Draw Objects
  for (const obj of sortedObjects) {
    if (!obj.visible) continue;

    ctx.save();

    // Position and rotation transform
    const centerX = obj.x + obj.width / 2;
    const centerY = obj.y + obj.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    ctx.globalAlpha = obj.opacity;

    const left = -obj.width / 2;
    const top = -obj.height / 2;

    if (obj.type === "image") {
      const imgObj = obj as ImageObject;

      // Handle flip transforms
      if (imgObj.flipH || imgObj.flipV) {
        ctx.scale(imgObj.flipH ? -1 : 1, imgObj.flipV ? -1 : 1);
      }

      // Render image canvas/element
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgObj.src;

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      // Offscreen canvas for photo adjustments
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = obj.width;
      tempCanvas.height = obj.height;

      const objAdjustments = imgObj.adjustments || (obj.id === "primary_photo" ? globalAdjustments : null);

      if (objAdjustments) {
        renderer.renderExport(img, tempCanvas, objAdjustments);
        ctx.drawImage(tempCanvas, left, top, obj.width, obj.height);
      } else {
        ctx.drawImage(img, left, top, obj.width, obj.height);
      }
    } else if (obj.type === "text") {
      const txt = obj as TextObject;
      ctx.font = `${txt.italic ? "italic " : ""}${txt.fontWeight} ${txt.fontSize}px ${txt.fontFamily}`;
      ctx.fillStyle = txt.color;
      ctx.textAlign = txt.textAlign as CanvasTextAlign;
      ctx.textBaseline = "middle";

      if (txt.shadowBlur > 0) {
        ctx.shadowColor = txt.shadowColor;
        ctx.shadowBlur = txt.shadowBlur;
        ctx.shadowOffsetX = txt.shadowOffsetX;
        ctx.shadowOffsetY = txt.shadowOffsetY;
      }

      let textX = left;
      if (txt.textAlign === "center") textX = 0;
      if (txt.textAlign === "right") textX = left + obj.width;

      ctx.fillText(txt.text, textX, 0);
    } else if (obj.type === "shape") {
      const shape = obj as ShapeObject;

      // Fill style
      if (shape.gradientFill) {
        const gradAngle = (shape.gradientFill.angle * Math.PI) / 180;
        const gx1 = left;
        const gy1 = top;
        const gx2 = left + Math.cos(gradAngle) * shape.width;
        const gy2 = top + Math.sin(gradAngle) * shape.height;
        const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
        grad.addColorStop(0, shape.gradientFill.color1);
        grad.addColorStop(1, shape.gradientFill.color2);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = shape.fill;
      }

      ctx.strokeStyle = shape.stroke;
      ctx.lineWidth = shape.strokeWidth;

      if (shape.shapeType === "rectangle" || shape.shapeType === "rounded-rectangle") {
        const r = shape.cornerRadius || 0;
        ctx.beginPath();
        if (r > 0 && ctx.roundRect) {
          ctx.roundRect(left, top, obj.width, obj.height, r);
        } else {
          ctx.rect(left, top, obj.width, obj.height);
        }
        ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      } else if (shape.shapeType === "circle") {
        ctx.beginPath();
        ctx.ellipse(0, 0, obj.width / 2, obj.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      } else if (shape.shapeType === "triangle") {
        ctx.beginPath();
        ctx.moveTo(0, top);
        ctx.lineTo(left + obj.width, top + obj.height);
        ctx.lineTo(left, top + obj.height);
        ctx.closePath();
        ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      }
    }

    ctx.restore();
  }

  renderer.destroy();

  // 5. Export to Data URL and trigger Download
  const mimeType = options.format === "png" ? "image/png" : options.format === "jpeg" ? "image/jpeg" : "image/webp";
  const dataUrl = canvas.toDataURL(mimeType, options.quality);

  const link = document.createElement("a");
  link.download = options.filename || `PixelRaw_Export_${Date.now()}.${options.format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportDevelopPhoto(
  imageUrl: string,
  adjustments: EditorAdjustments,
  options: ExportOptions
): Promise<void> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const renderer = new ImageRenderer();
  renderer.renderExport(img, canvas, adjustments);
  renderer.destroy();

  const mimeType = options.format === "png" ? "image/png" : options.format === "jpeg" ? "image/jpeg" : "image/webp";
  const dataUrl = canvas.toDataURL(mimeType, options.quality);

  const link = document.createElement("a");
  link.download = options.filename || `PixelRaw_Photo_${Date.now()}.${options.format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
