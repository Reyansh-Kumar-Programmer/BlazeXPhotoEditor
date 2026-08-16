import { EditorAdjustments, Preset } from "@/types/editor";
import { DEFAULT_EDITOR_ADJUSTMENTS } from "@/stores/editorStore";

export const PRESETS: Preset[] = [
  {
    id: "original",
    name: "Original",
    description: "Reset all photo adjustments to defaults.",
    category: "Standard",
    adjustments: {},
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Teal & orange filmic look with rich contrast and dark corners.",
    category: "Style",
    adjustments: {
      basic: {
        exposure: 5,
        contrast: 20,
        highlights: -25,
        shadows: 20,
        whites: -10,
        blacks: -15,
      },
      color: {
        temperature: -12,
        tint: 8,
        vibrance: 20,
        saturation: -5,
      },
      effects: {
        clarity: 15,
        vignette: 25,
      },
      hsl: {
        blue: { hue: -15, saturation: 20, luminance: -10 },
        orange: { hue: 10, saturation: 25, luminance: 10 },
      },
    },
  },
  {
    id: "moody",
    name: "Moody",
    description: "Low exposure, deep blacks, cool shadow tones.",
    category: "Style",
    adjustments: {
      basic: {
        exposure: -15,
        contrast: 25,
        highlights: -35,
        shadows: -10,
        whites: -15,
        blacks: -25,
      },
      color: {
        temperature: -15,
        tint: -5,
        vibrance: -10,
        saturation: -15,
      },
      effects: {
        dehaze: 10,
        vignette: 35,
      },
    },
  },
  {
    id: "warm",
    name: "Warm Golden",
    description: "Sun-drenched golden hour warmth and vibrant tones.",
    category: "Standard",
    adjustments: {
      basic: {
        exposure: 10,
        contrast: 10,
        highlights: -10,
        shadows: 15,
      },
      color: {
        temperature: 28,
        tint: 5,
        vibrance: 20,
        saturation: 10,
      },
    },
  },
  {
    id: "cool",
    name: "Nordic Cool",
    description: "Crisp blue tones, clean whites, and refined contrast.",
    category: "Standard",
    adjustments: {
      basic: {
        exposure: 5,
        contrast: 15,
        highlights: 10,
        whites: 15,
      },
      color: {
        temperature: -25,
        tint: -8,
        vibrance: 10,
        saturation: -5,
      },
    },
  },
  {
    id: "vintage",
    name: "Vintage 1970s",
    description: "Soft contrast, faded matte blacks, warm tint, and film grain.",
    category: "Film",
    adjustments: {
      basic: {
        exposure: 5,
        contrast: -20,
        highlights: -20,
        shadows: 25,
        whites: -15,
        blacks: 30,
      },
      color: {
        temperature: 20,
        tint: 12,
        vibrance: -10,
        saturation: -20,
      },
      effects: {
        vignette: 20,
        grain: 30,
      },
    },
  },
  {
    id: "film",
    name: "Classic Film",
    description: "Analog film aesthetic with subtle color shifts and organic grain.",
    category: "Film",
    adjustments: {
      basic: {
        exposure: 0,
        contrast: 12,
        highlights: -15,
        shadows: 15,
        blacks: 18,
      },
      color: {
        temperature: 10,
        tint: -5,
        vibrance: 5,
        saturation: -10,
      },
      effects: {
        texture: 10,
        grain: 25,
      },
    },
  },
  {
    id: "vibrant",
    name: "Vibrant Punch",
    description: "High pop color saturation, crisp clarity, and vivid tones.",
    category: "Standard",
    adjustments: {
      basic: {
        exposure: 10,
        contrast: 20,
        highlights: -10,
        shadows: 10,
        whites: 10,
      },
      color: {
        temperature: 5,
        tint: 0,
        vibrance: 40,
        saturation: 20,
      },
      effects: {
        clarity: 15,
        dehaze: 10,
      },
    },
  },
  {
    id: "portrait",
    name: "Soft Portrait",
    description: "Flattering skin tones with smooth contrast and gentle highlights.",
    category: "Standard",
    adjustments: {
      basic: {
        exposure: 8,
        contrast: 5,
        highlights: -20,
        shadows: 18,
        whites: -5,
      },
      color: {
        temperature: 10,
        tint: 5,
        vibrance: 12,
        saturation: -5,
      },
      effects: {
        texture: -10,
        clarity: -8,
      },
      hsl: {
        orange: { hue: 0, saturation: 10, luminance: 15 },
        red: { hue: 5, saturation: 5, luminance: 10 },
      },
    },
  },
  {
    id: "bw",
    name: "Black & White",
    description: "High-contrast fine art monochrome development.",
    category: "Monochrome",
    adjustments: {
      basic: {
        exposure: 5,
        contrast: 25,
        highlights: -15,
        shadows: 15,
        whites: 15,
        blacks: -15,
      },
      color: {
        temperature: 0,
        tint: 0,
        vibrance: 0,
        saturation: -100,
      },
      effects: {
        clarity: 15,
        grain: 15,
      },
    },
  },
];

export function getPresetAdjustments(presetId: string): EditorAdjustments {
  const base = JSON.parse(JSON.stringify(DEFAULT_EDITOR_ADJUSTMENTS)) as EditorAdjustments;
  const preset = PRESETS.find((p) => p.id === presetId);

  if (!preset || presetId === "original") {
    return base;
  }

  const { basic, color, effects, hsl } = preset.adjustments;

  if (basic) {
    base.basic = { ...base.basic, ...basic };
  }
  if (color) {
    base.color = { ...base.color, ...color };
  }
  if (effects) {
    base.effects = { ...base.effects, ...effects };
  }
  if (hsl) {
    Object.keys(hsl).forEach((ch) => {
      const channelKey = ch as keyof typeof hsl;
      if (hsl[channelKey]) {
        base.hsl[channelKey] = {
          ...base.hsl[channelKey],
          ...hsl[channelKey],
        };
      }
    });
  }

  return base;
}
