import { EditorAdjustments, HSLChannelName } from "@/types/editor";
import { buildToneCurveLUTs } from "./toneCurve";

// HSL Channel center hues (in degrees [0..360])
const HSL_CENTER_HUES: Record<HSLChannelName, number> = {
  red: 0,
  orange: 30,
  yellow: 60,
  green: 120,
  aqua: 180,
  blue: 240,
  purple: 285,
  magenta: 330,
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getHueWeight(pixelHue: number, targetHue: number): number {
  let diff = Math.abs(pixelHue - targetHue);
  if (diff > 180) diff = 360 - diff;
  const maxSpan = 35;
  if (diff >= maxSpan) return 0;
  return Math.cos((diff / maxSpan) * (Math.PI / 2));
}

export function applyAdjustments(
  imageData: ImageData,
  adjustments: EditorAdjustments,
  isBeforeMode: boolean = false
): ImageData {
  if (isBeforeMode) {
    return imageData;
  }

  const { basic, color, effects, hsl, curve, detail, optics } = adjustments;
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // 1. Exposure Factor
  const exposureFactor = Math.pow(2, basic.exposure / 50);

  // 2. Contrast Factor
  const contrastFactor = (259 * (basic.contrast + 255)) / (255 * (259 - basic.contrast));

  // 3. Temperature & Tint Shifts
  const tempShiftR = (color.temperature / 100) * 35;
  const tempShiftB = -(color.temperature / 100) * 35;
  const tintShiftG = -(color.tint / 100) * 25;

  // 4. Tone Curve LUTs
  const luts = buildToneCurveLUTs(curve);
  const hasToneCurve =
    curve.rgb.some((p) => p.x !== p.y) ||
    curve.red.some((p) => p.x !== p.y) ||
    curve.green.some((p) => p.x !== p.y) ||
    curve.blue.some((p) => p.x !== p.y);

  // Check HSL modifications
  const hasHslChanges = Object.values(hsl).some(
    (ch) => ch.hue !== 0 || ch.saturation !== 0 || ch.luminance !== 0
  );

  // Primary Pixel Pass: Basic, WB, HSL, Tone Curve, Vibrance/Saturation
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    // --- Exposure ---
    if (basic.exposure !== 0) {
      r *= exposureFactor;
      g *= exposureFactor;
      b *= exposureFactor;
    }

    // --- Contrast ---
    if (basic.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // --- Highlights & Shadows ---
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const normalizedLum = Math.min(1, Math.max(0, lum / 255));

    if (basic.highlights !== 0) {
      const highlightWeight = Math.pow(normalizedLum, 2);
      const shift = (basic.highlights / 100) * 50 * highlightWeight;
      r += shift;
      g += shift;
      b += shift;
    }

    if (basic.shadows !== 0) {
      const shadowWeight = Math.pow(1 - normalizedLum, 2);
      const shift = (basic.shadows / 100) * 50 * shadowWeight;
      r += shift;
      g += shift;
      b += shift;
    }

    // --- Whites & Blacks ---
    if (basic.whites !== 0 && normalizedLum > 0.65) {
      const weight = (normalizedLum - 0.65) / 0.35;
      const shift = (basic.whites / 100) * 40 * weight;
      r += shift;
      g += shift;
      b += shift;
    }

    if (basic.blacks !== 0 && normalizedLum < 0.35) {
      const weight = (0.35 - normalizedLum) / 0.35;
      const shift = (basic.blacks / 100) * 40 * weight;
      r += shift;
      g += shift;
      b += shift;
    }

    // --- White Balance (Temp & Tint) ---
    if (color.temperature !== 0 || color.tint !== 0) {
      r += tempShiftR;
      g += tintShiftG;
      b += tempShiftB;
    }

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    // --- Selective HSL Color Mixer ---
    if (hasHslChanges) {
      const [h, s, l] = rgbToHsl(r, g, b);
      let deltaH = 0;
      let satMult = 1;
      let lumMult = 1;

      (Object.keys(hsl) as HSLChannelName[]).forEach((channelName) => {
        const ch = hsl[channelName];
        if (ch.hue === 0 && ch.saturation === 0 && ch.luminance === 0) return;

        const targetHue = HSL_CENTER_HUES[channelName];
        const weight = getHueWeight(h, targetHue);
        if (weight > 0) {
          deltaH += weight * (ch.hue * 0.4);
          satMult += weight * (ch.saturation / 100);
          lumMult += weight * (ch.luminance / 100);
        }
      });

      const newH = (h + deltaH + 360) % 360;
      const newS = Math.min(1, Math.max(0, s * Math.max(0, satMult)));
      const newL = Math.min(1, Math.max(0, l * Math.max(0, lumMult)));

      [r, g, b] = hslToRgb(newH, newS, newL);
    }

    // --- Tone Curve LUT Application ---
    if (hasToneCurve) {
      const rClamped = Math.round(Math.min(255, Math.max(0, r)));
      const gClamped = Math.round(Math.min(255, Math.max(0, g)));
      const bClamped = Math.round(Math.min(255, Math.max(0, b)));

      r = luts.rgb[luts.red[rClamped]];
      g = luts.rgb[luts.green[gClamped]];
      b = luts.rgb[luts.blue[bClamped]];
    }

    // --- Vibrance & Saturation ---
    if (color.saturation !== 0 || color.vibrance !== 0) {
      const pLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      let satMult = 1 + color.saturation / 100;

      if (color.vibrance !== 0) {
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const currentSat = pLum === 0 ? 0 : (maxC - minC) / 255;
        const vibranceBoost = (1 - currentSat) * (color.vibrance / 100);
        satMult += vibranceBoost;
      }

      r = pLum + (r - pLum) * satMult;
      g = pLum + (g - pLum) * satMult;
      b = pLum + (b - pLum) * satMult;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  // --- Effects Pass: Texture, Clarity, Dehaze ---
  const { texture, clarity, dehaze } = effects;

  if (dehaze !== 0) {
    const factor = dehaze / 100;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      if (factor > 0) {
        r = r - factor * 25 * (lum / 255);
        g = g - factor * 25 * (lum / 255);
        b = b - factor * 20 * (lum / 255);
      } else {
        r = r - factor * 30 * (1 - lum / 255);
        g = g - factor * 30 * (1 - lum / 255);
        b = b - factor * 30 * (1 - lum / 255);
      }
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }
  }

  if (texture !== 0 || clarity !== 0) {
    const copy = new Uint8ClampedArray(data);
    const texFactor = texture / 100;
    const clarFactor = clarity / 100;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        let sumR = 0, sumG = 0, sumB = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            sumR += copy[nIdx];
            sumG += copy[nIdx + 1];
            sumB += copy[nIdx + 2];
          }
        }
        const avgR = sumR / 9;
        const avgG = sumG / 9;
        const avgB = sumB / 9;

        let r = copy[idx];
        let g = copy[idx + 1];
        let b = copy[idx + 2];

        if (texture !== 0) {
          r += (r - avgR) * texFactor * 1.5;
          g += (g - avgG) * texFactor * 1.5;
          b += (b - avgB) * texFactor * 1.5;
        }

        if (clarity !== 0) {
          const diffR = r - avgR;
          const diffG = g - avgG;
          const diffB = b - avgB;
          r += diffR * clarFactor * 2.0;
          g += diffG * clarFactor * 2.0;
          b += diffB * clarFactor * 2.0;
        }

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
      }
    }
  }

  // --- Detail Pass: Noise Reduction & Sharpening ---
  const { sharpnessAmount, sharpnessRadius, sharpnessDetail, sharpnessMasking, luminanceNoise, colorNoise } = detail;

  // 1. Color Noise Reduction (Chroma smoothing)
  if (colorNoise > 0) {
    const copy = new Uint8ClampedArray(data);
    const strength = colorNoise / 100;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        let sumCb = 0, sumCr = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const nr = copy[nIdx], ng = copy[nIdx + 1], nb = copy[nIdx + 2];
            const cb = -0.168736 * nr - 0.331264 * ng + 0.5 * nb;
            const cr = 0.5 * nr - 0.418688 * ng - 0.081312 * nb;
            sumCb += cb;
            sumCr += cr;
          }
        }
        const avgCb = sumCb / 9;
        const avgCr = sumCr / 9;

        const origR = copy[idx], origG = copy[idx + 1], origB = copy[idx + 2];
        const Y = 0.299 * origR + 0.587 * origG + 0.114 * origB;
        const curCb = -0.168736 * origR - 0.331264 * origG + 0.5 * origB;
        const curCr = 0.5 * origR - 0.418688 * origG - 0.081312 * origB;

        const finalCb = curCb + (avgCb - curCb) * strength;
        const finalCr = curCr + (avgCr - curCr) * strength;

        const newR = Y + 1.402 * finalCr;
        const newG = Y - 0.344136 * finalCb - 0.714136 * finalCr;
        const newB = Y + 1.772 * finalCb;

        data[idx] = Math.min(255, Math.max(0, newR));
        data[idx + 1] = Math.min(255, Math.max(0, newG));
        data[idx + 2] = Math.min(255, Math.max(0, newB));
      }
    }
  }

  // 2. Luminance Noise Reduction (Bilateral edge-preserving smoothing)
  if (luminanceNoise > 0) {
    const copy = new Uint8ClampedArray(data);
    const threshold = (100 - detail.noiseDetail) * 0.4 + (luminanceNoise / 100) * 30;
    const strength = luminanceNoise / 100;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const centerR = copy[idx], centerG = copy[idx + 1], centerB = copy[idx + 2];
        const centerLum = 0.2126 * centerR + 0.7152 * centerG + 0.0722 * centerB;

        let sumR = 0, sumG = 0, sumB = 0, totalW = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const nR = copy[nIdx], nG = copy[nIdx + 1], nB = copy[nIdx + 2];
            const nLum = 0.2126 * nR + 0.7152 * nG + 0.0722 * nB;
            const diff = Math.abs(centerLum - nLum);

            if (diff < threshold) {
              const w = 1 - diff / threshold;
              sumR += nR * w;
              sumG += nG * w;
              sumB += nB * w;
              totalW += w;
            }
          }
        }

        if (totalW > 0) {
          const avgR = sumR / totalW;
          const avgG = sumG / totalW;
          const avgB = sumB / totalW;
          data[idx] = Math.min(255, Math.max(0, centerR + (avgR - centerR) * strength));
          data[idx + 1] = Math.min(255, Math.max(0, centerG + (avgG - centerG) * strength));
          data[idx + 2] = Math.min(255, Math.max(0, centerB + (avgB - centerB) * strength));
        }
      }
    }
  }

  // 3. Advanced Sharpening
  const totalSharpening = sharpnessAmount + effects.sharpness;
  if (totalSharpening > 0) {
    const copy = new Uint8ClampedArray(data);
    const amount = totalSharpening / 100;
    const detailWeight = 0.5 + sharpnessDetail / 100;
    const maskingThreshold = (sharpnessMasking / 100) * 40;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const r = copy[idx], g = copy[idx + 1], b = copy[idx + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // Neighbor box average
        const upIdx = ((y - 1) * width + x) * 4;
        const downIdx = ((y + 1) * width + x) * 4;
        const leftIdx = (y * width + (x - 1)) * 4;
        const rightIdx = (y * width + (x + 1)) * 4;

        const avgR = (copy[upIdx] + copy[downIdx] + copy[leftIdx] + copy[rightIdx]) / 4;
        const avgG = (copy[upIdx + 1] + copy[downIdx + 1] + copy[leftIdx + 1] + copy[rightIdx + 1]) / 4;
        const avgB = (copy[upIdx + 2] + copy[downIdx + 2] + copy[leftIdx + 2] + copy[rightIdx + 2]) / 4;
        const avgLum = 0.2126 * avgR + 0.7152 * avgG + 0.0722 * avgB;

        const edgeMagnitude = Math.abs(lum - avgLum);
        if (edgeMagnitude >= maskingThreshold) {
          const diffR = r - avgR;
          const diffG = g - avgG;
          const diffB = b - avgB;

          data[idx] = Math.min(255, Math.max(0, r + diffR * amount * detailWeight * 1.5));
          data[idx + 1] = Math.min(255, Math.max(0, g + diffG * amount * detailWeight * 1.5));
          data[idx + 2] = Math.min(255, Math.max(0, b + diffB * amount * detailWeight * 1.5));
        }
      }
    }
  }

  // --- Optics Pass: Distortion ---
  if (optics.distortion !== 0) {
    const copy = new Uint8ClampedArray(data);
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const k = (optics.distortion / 100) * 0.25;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x - cx) / maxR;
        const dy = (y - cy) / maxR;
        const r2 = dx * dx + dy * dy;
        const factor = 1 + k * r2;

        const srcX = Math.round(cx + dx * factor * maxR);
        const srcY = Math.round(cy + dy * factor * maxR);

        const destIdx = (y * width + x) * 4;

        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          const srcIdx = (srcY * width + srcX) * 4;
          data[destIdx] = copy[srcIdx];
          data[destIdx + 1] = copy[srcIdx + 1];
          data[destIdx + 2] = copy[srcIdx + 2];
        } else {
          data[destIdx] = 0;
          data[destIdx + 1] = 0;
          data[destIdx + 2] = 0;
        }
      }
    }
  }

  // --- Optics Vignette Pass ---
  const vignetteVal = optics.vignetteAmount || effects.vignette;
  if (vignetteVal !== 0) {
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const factor = vignetteVal / 100;
    const midpointNorm = optics.vignetteMidpoint / 100;
    const featherNorm = Math.max(0.01, optics.vignetteFeather / 100);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

        let falloff = 0;
        if (dist > midpointNorm) {
          const delta = (dist - midpointNorm) / featherNorm;
          falloff = Math.min(1, Math.pow(delta, 2));
        }

        const vignetteScale = 1 - factor * falloff * 0.85;
        const idx = (y * width + x) * 4;

        data[idx] = Math.min(255, Math.max(0, data[idx] * vignetteScale));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] * vignetteScale));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] * vignetteScale));
      }
    }
  }

  // --- Grain Pass ---
  if (effects.grain !== 0) {
    const intensity = (effects.grain / 100) * 35;
    for (let i = 0; i < data.length; i += 4) {
      const noise = ((i * 1259 + 31) % 101 - 50) / 50;
      const amount = noise * intensity;
      data[i] = Math.min(255, Math.max(0, data[i] + amount));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + amount));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + amount));
    }
  }

  return imageData;
}
