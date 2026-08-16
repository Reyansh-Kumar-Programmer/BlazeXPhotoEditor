import { CurvePoint, ToneCurveState } from "@/types/editor";

export const CURVE_PRESETS: { id: string; name: string; points: CurvePoint[] }[] = [
  {
    id: "linear",
    name: "Linear",
    points: [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ],
  },
  {
    id: "scurve",
    name: "S-Curve",
    points: [
      { x: 0, y: 0 },
      { x: 64, y: 45 },
      { x: 192, y: 210 },
      { x: 255, y: 255 },
    ],
  },
  {
    id: "strong_contrast",
    name: "Strong Contrast",
    points: [
      { x: 0, y: 0 },
      { x: 64, y: 30 },
      { x: 192, y: 225 },
      { x: 255, y: 255 },
    ],
  },
  {
    id: "soft_contrast",
    name: "Soft Contrast",
    points: [
      { x: 0, y: 0 },
      { x: 64, y: 55 },
      { x: 192, y: 200 },
      { x: 255, y: 255 },
    ],
  },
  {
    id: "fade",
    name: "Fade",
    points: [
      { x: 0, y: 25 },
      { x: 64, y: 70 },
      { x: 192, y: 205 },
      { x: 255, y: 255 },
    ],
  },
  {
    id: "matte",
    name: "Matte",
    points: [
      { x: 0, y: 35 },
      { x: 64, y: 65 },
      { x: 192, y: 190 },
      { x: 255, y: 240 },
    ],
  },
];

/**
 * Fritsch-Carlson Monotone Cubic Hermite Spline Interpolation.
 * Computes a smooth monotonic 256-entry lookup table (LUT) from control points.
 */
export function buildCurveLUT(points: CurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256);
  if (!points || points.length === 0) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }

  // Sort points by X coordinate
  const pts = [...points].sort((a, b) => a.x - b.x);

  // Ensure start at X=0 and end at X=255
  if (pts[0].x > 0) {
    pts.unshift({ x: 0, y: pts[0].y });
  }
  if (pts[pts.length - 1].x < 255) {
    pts.push({ x: 255, y: pts[pts.length - 1].y });
  }

  const n = pts.length;
  if (n === 2) {
    const x0 = pts[0].x, y0 = pts[0].y;
    const x1 = pts[1].x, y1 = pts[1].y;
    const slope = (y1 - y0) / Math.max(1, x1 - x0);
    for (let i = 0; i < 256; i++) {
      const val = Math.round(y0 + (i - x0) * slope);
      lut[i] = Math.min(255, Math.max(0, val));
    }
    return lut;
  }

  // Calculate secants & tangents (Fritsch-Carlson)
  const dx = new Float32Array(n - 1);
  const dy = new Float32Array(n - 1);
  const m = new Float32Array(n - 1);

  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x;
    dy[i] = pts[i + 1].y - pts[i].y;
    m[i] = dx[i] === 0 ? 0 : dy[i] / dx[i];
  }

  const c = new Float32Array(n);
  c[0] = m[0];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      c[i] = 0;
    } else {
      c[i] = (m[i - 1] + m[i]) / 2;
    }
  }
  c[n - 1] = m[n - 2];

  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      c[i] = 0;
      c[i + 1] = 0;
    } else {
      const a = c[i] / m[i];
      const b = c[i + 1] / m[i];
      const h = Math.hypot(a, b);
      if (h > 3) {
        c[i] = (3 * a / h) * m[i];
        c[i + 1] = (3 * b / h) * m[i];
      }
    }
  }

  // Populate 256-entry LUT
  let seg = 0;
  for (let i = 0; i < 256; i++) {
    while (seg < n - 2 && i > pts[seg + 1].x) {
      seg++;
    }
    const x0 = pts[seg].x;
    const x1 = pts[seg + 1].x;
    const y0 = pts[seg].y;
    const y1 = pts[seg + 1].y;
    const h = x1 - x0;

    if (h === 0) {
      lut[i] = Math.min(255, Math.max(0, Math.round(y0)));
    } else {
      const t = (i - x0) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;

      const y = h00 * y0 + h10 * h * c[seg] + h01 * y1 + h11 * h * c[seg + 1];
      lut[i] = Math.min(255, Math.max(0, Math.round(y)));
    }
  }

  return lut;
}

export interface ToneCurveLUTs {
  rgb: Uint8Array;
  red: Uint8Array;
  green: Uint8Array;
  blue: Uint8Array;
}

export function buildToneCurveLUTs(curveState: ToneCurveState): ToneCurveLUTs {
  return {
    rgb: buildCurveLUT(curveState.rgb),
    red: buildCurveLUT(curveState.red),
    green: buildCurveLUT(curveState.green),
    blue: buildCurveLUT(curveState.blue),
  };
}
