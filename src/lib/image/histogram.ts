import { HistogramData } from "@/types/editor";

/**
 * Calculates 256-bin Red, Green, Blue, and Luminance histogram data
 * directly from processed canvas ImageData.
 */
export function calculateHistogram(imageData: ImageData): HistogramData {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const l = new Array(256).fill(0);

  const data = imageData.data;
  // Dynamic downsample step for smooth 60fps performance on high-res images
  const step = Math.max(1, Math.floor(data.length / (4 * 60000))) * 4;

  for (let i = 0; i < data.length; i += step) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const alpha = data[i + 3];

    if (alpha < 10) continue; // Skip transparent pixels

    r[red]++;
    g[green]++;
    b[blue]++;

    // Rec. 709 Luminance
    const luma = Math.round(0.2126 * red + 0.7152 * green + 0.0722 * blue);
    l[Math.min(255, Math.max(0, luma))]++;
  }

  return { r, g, b, l };
}
