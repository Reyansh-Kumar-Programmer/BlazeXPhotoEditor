import {
  DocumentPreset,
  DesignTool,
  EditorObject,
  DocumentBackground,
  Guide,
  GridSettings,
  SnapSettings,
  CropState,
  CropRatioPreset,
} from "./design";

export type EditorSection = "library" | "develop" | "compare" | "design";
export type Mode = "develop" | "design";
export type ThemeMode = "light" | "dark";

export interface BasicAdjustments {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
}

export interface ColorAdjustments {
  temperature: number;
  tint: number;
  vibrance: number;
  saturation: number;
}

export interface EffectAdjustments {
  texture: number;
  clarity: number;
  dehaze: number;
  sharpness: number;
  vignette: number;
  grain: number;
}

export type HSLChannelName =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "aqua"
  | "blue"
  | "purple"
  | "magenta";

export interface HSLChannel {
  hue: number;
  saturation: number;
  luminance: number;
}

export type HSLAdjustments = Record<HSLChannelName, HSLChannel>;

// Tone Curve Types
export interface CurvePoint {
  x: number; // 0..255
  y: number; // 0..255
}

export type ToneCurveChannel = "rgb" | "red" | "green" | "blue";

export interface ToneCurveState {
  rgb: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

// Detail Types
export interface DetailAdjustments {
  sharpnessAmount: number;   // 0..100
  sharpnessRadius: number;   // 0.5..3.0
  sharpnessDetail: number;   // 0..100
  sharpnessMasking: number;  // 0..100
  luminanceNoise: number;    // 0..100
  noiseDetail: number;       // 0..100
  noiseContrast: number;     // 0..100
  colorNoise: number;        // 0..100
}

// Optics Types
export interface OpticsAdjustments {
  enableLensCorrection: boolean;
  chromaticAberration: boolean;
  distortion: number;       // -100..100
  vignetteAmount: number;   // -100..100
  vignetteMidpoint: number; // 0..100
  vignetteFeather: number;  // 0..100
}

export interface EditorAdjustments {
  basic: BasicAdjustments;
  color: ColorAdjustments;
  effects: EffectAdjustments;
  hsl: HSLAdjustments;
  curve: ToneCurveState;
  detail: DetailAdjustments;
  optics: OpticsAdjustments;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: "Standard" | "Style" | "Film" | "Monochrome";
  adjustments: Partial<{
    basic: Partial<BasicAdjustments>;
    color: Partial<ColorAdjustments>;
    effects: Partial<EffectAdjustments>;
    hsl: Partial<HSLAdjustments>;
    curve: Partial<ToneCurveState>;
    detail: Partial<DetailAdjustments>;
    optics: Partial<OpticsAdjustments>;
  }>;
}

export interface ImageState {
  file: File | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PanState {
  x: number;
  y: number;
}

export interface HistogramData {
  r: number[];
  g: number[];
  b: number[];
  l: number[];
}

export interface EditorState {
  activeSection: EditorSection;
  mode: Mode;
  zoom: number;
  isBeforeAfter: boolean;
  isLibraryOpen: boolean;
  isRightPanelOpen: boolean;
  isProcessing: boolean;
  theme: ThemeMode;
  activePresetId: string | null;

  // Design Canvas & Objects State
  objects: EditorObject[];
  selectedObjectIds: string[];
  activeTool: DesignTool;
  documentPreset: DocumentPreset;
  documentBackground: DocumentBackground;

  // Overlays & Guides
  guides: Guide[];
  grid: GridSettings;
  smartGuides: boolean;
  snapSettings: SnapSettings;
  showRulers: boolean;
  showSafeArea: boolean;

  // Crop & Transform State
  cropState: CropState;

  // Clipboard State
  clipboard: EditorObject[];

  // Image State
  image: ImageState;

  // Pan State
  pan: PanState;

  // Histogram
  histogram: HistogramData | null;

  // Nested Adjustments
  adjustments: EditorAdjustments;

  // History State
  history: EditorAdjustments[];
  historyIndex: number;

  // Actions
  setActiveSection: (section: EditorSection) => void;
  setMode: (mode: Mode) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPan: (pan: PanState | ((prev: PanState) => PanState)) => void;
  resetPan: () => void;
  toggleBeforeAfter: () => void;
  toggleLibrary: () => void;
  toggleRightPanel: () => void;
  toggleTheme: () => void;

  // Design Object & Document Actions
  setActiveTool: (tool: DesignTool) => void;
  setDocumentPreset: (preset: DocumentPreset) => void;
  setCustomDocumentSize: (width: number, height: number, name?: string) => void;
  setDocumentBackground: (bg: Partial<DocumentBackground>) => void;
  createNewProject: (preset: DocumentPreset, background?: DocumentBackground) => void;

  // Overlay & Guide Actions
  addGuide: (type: "horizontal" | "vertical", position: number) => void;
  removeGuide: (id: string) => void;
  clearGuides: () => void;
  setGridSettings: (settings: Partial<GridSettings>) => void;
  toggleGrid: () => void;
  setSmartGuides: (enabled: boolean) => void;
  setSnapSettings: (settings: Partial<SnapSettings>) => void;
  toggleRulers: () => void;
  toggleSafeArea: () => void;

  // Crop Actions
  setCropState: (crop: Partial<CropState>) => void;
  startCrop: () => void;
  applyCrop: () => void;
  cancelCrop: () => void;
  rotateActive: (direction: "left" | "right") => void;
  flipActive: (direction: "horizontal" | "vertical") => void;

  // Object & Clipboard Actions
  addObject: (object: EditorObject) => void;
  updateObject: (id: string, updates: Partial<EditorObject>) => void;
  updateObjects: (updatesMap: Record<string, Partial<EditorObject>>) => void;
  deleteSelectedObjects: () => void;
  duplicateSelectedObjects: () => void;
  copySelectedObjects: () => void;
  pasteObjects: () => void;
  cutSelectedObjects: () => void;

  setSelectedObjectIds: (ids: string[]) => void;
  toggleObjectSelection: (id: string) => void;
  clearSelection: () => void;
  reorderObject: (id: string, direction: "up" | "down" | "top" | "bottom") => void;
  groupSelectedObjects: () => void;
  ungroupSelectedObjects: () => void;
  alignSelectedObjects: (
    alignment:
      | "left"
      | "center"
      | "right"
      | "top"
      | "middle"
      | "bottom"
      | "canvasLeft"
      | "canvasCenter"
      | "canvasRight"
      | "canvasTop"
      | "canvasMiddle"
      | "canvasBottom"
      | "canvasBoth"
  ) => void;
  distributeSelectedObjects: (axis: "horizontal" | "vertical") => void;
  moveSelectedObjectsByArrow: (dx: number, dy: number) => void;

  // Image Actions
  setImageFile: (file: File) => Promise<void>;
  clearImage: () => void;
  setImageError: (error: string | null) => void;
  setHistogramData: (data: HistogramData) => void;
  setIsProcessing: (isProcessing: boolean) => void;

  // Granular Adjustment Actions
  setBasicAdjustment: (key: keyof BasicAdjustments, value: number) => void;
  setColorAdjustment: (key: keyof ColorAdjustments, value: number) => void;
  setEffectAdjustment: (key: keyof EffectAdjustments, value: number) => void;
  setHSLAdjustment: (
    channel: HSLChannelName,
    property: keyof HSLChannel,
    value: number
  ) => void;
  setCurvePoints: (channel: ToneCurveChannel, points: CurvePoint[]) => void;
  setDetailAdjustment: (key: keyof DetailAdjustments, value: number) => void;
  setOpticsAdjustment: <K extends keyof OpticsAdjustments>(
    key: K,
    value: OpticsAdjustments[K]
  ) => void;

  resetSection: (
    section: "basic" | "color" | "effects" | "hsl" | "curve" | "detail" | "optics"
  ) => void;
  resetAllAdjustments: () => void;
  applyPreset: (presetId: string, presetAdjustments: EditorAdjustments) => void;

  // History Actions
  commitHistorySnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
