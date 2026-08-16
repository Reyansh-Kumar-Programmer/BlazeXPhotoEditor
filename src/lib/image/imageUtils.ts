import { HistogramData } from "@/types/editor";

export const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export interface LoadedImageInfo {
  img: HTMLImageElement;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (file.size === 0) {
    return { valid: false, error: "Selected file is empty." };
  }

  const isSupportedMime = SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase());
  const fileNameLower = file.name.toLowerCase();
  const isSupportedExt = SUPPORTED_EXTENSIONS.some((ext) =>
    fileNameLower.endsWith(ext)
  );

  if (!isSupportedMime && !isSupportedExt) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || file.name}). Please import JPG, JPEG, PNG, or WEBP images.`,
    };
  }

  return { valid: true };
}

export function loadImageFromFile(file: File): Promise<LoadedImageInfo> {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const thumbnailUrl = createThumbnail(img, 180);
        resolve({
          img,
          url: objectUrl,
          thumbnailUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err instanceof Error ? err : new Error("Failed to process image preview."));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image. The file may be corrupted or unreadable."));
    };

    img.src = objectUrl;
  });
}

export function createThumbnail(
  img: HTMLImageElement,
  maxDimension: number = 180
): string {
  const canvas = document.createElement("canvas");
  let width = img.naturalWidth || img.width || maxDimension;
  let height = img.naturalHeight || img.height || maxDimension;

  if (width > height) {
    if (width > maxDimension) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    }
  } else {
    if (height > maxDimension) {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/webp", 0.8);
}

import { calculateHistogram } from "./histogram";
export { calculateHistogram };

