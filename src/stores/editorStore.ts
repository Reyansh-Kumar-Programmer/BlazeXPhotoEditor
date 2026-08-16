import { create } from "zustand";
import {
  BasicAdjustments,
  ColorAdjustments,
  CurvePoint,
  DetailAdjustments,
  EditorAdjustments,
  EditorSection,
  EditorState,
  EffectAdjustments,
  HistogramData,
  HSLAdjustments,
  HSLChannelName,
  HSLChannel,
  ImageState,
  Mode,
  OpticsAdjustments,
  PanState,
  ThemeMode,
  ToneCurveChannel,
  ToneCurveState,
} from "@/types/editor";
import {
  DOCUMENT_PRESETS,
  DesignTool,
  DocumentPreset,
  DocumentBackground,
  Guide,
  GridSettings,
  SnapSettings,
  CropState,
  EditorObject,
  GroupObject,
  ImageObject,
} from "@/types/design";
import { loadImageFromFile } from "@/lib/image/imageUtils";

export const DEFAULT_BASIC_ADJUSTMENTS: BasicAdjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
};

export const DEFAULT_COLOR_ADJUSTMENTS: ColorAdjustments = {
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
};

export const DEFAULT_EFFECT_ADJUSTMENTS: EffectAdjustments = {
  texture: 0,
  clarity: 0,
  dehaze: 0,
  sharpness: 0,
  vignette: 0,
  grain: 0,
};

const DEFAULT_HSL_CHANNEL: HSLChannel = {
  hue: 0,
  saturation: 0,
  luminance: 0,
};

export const DEFAULT_HSL_ADJUSTMENTS: HSLAdjustments = {
  red: { ...DEFAULT_HSL_CHANNEL },
  orange: { ...DEFAULT_HSL_CHANNEL },
  yellow: { ...DEFAULT_HSL_CHANNEL },
  green: { ...DEFAULT_HSL_CHANNEL },
  aqua: { ...DEFAULT_HSL_CHANNEL },
  blue: { ...DEFAULT_HSL_CHANNEL },
  purple: { ...DEFAULT_HSL_CHANNEL },
  magenta: { ...DEFAULT_HSL_CHANNEL },
};

export const DEFAULT_CURVE_POINTS: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 255, y: 255 },
];

export const DEFAULT_TONE_CURVE: ToneCurveState = {
  rgb: [...DEFAULT_CURVE_POINTS],
  red: [...DEFAULT_CURVE_POINTS],
  green: [...DEFAULT_CURVE_POINTS],
  blue: [...DEFAULT_CURVE_POINTS],
};

export const DEFAULT_DETAIL_ADJUSTMENTS: DetailAdjustments = {
  sharpnessAmount: 0,
  sharpnessRadius: 1.0,
  sharpnessDetail: 25,
  sharpnessMasking: 0,
  luminanceNoise: 0,
  noiseDetail: 50,
  noiseContrast: 0,
  colorNoise: 25,
};

export const DEFAULT_OPTICS_ADJUSTMENTS: OpticsAdjustments = {
  enableLensCorrection: false,
  chromaticAberration: false,
  distortion: 0,
  vignetteAmount: 0,
  vignetteMidpoint: 50,
  vignetteFeather: 50,
};

export const DEFAULT_EDITOR_ADJUSTMENTS: EditorAdjustments = {
  basic: { ...DEFAULT_BASIC_ADJUSTMENTS },
  color: { ...DEFAULT_COLOR_ADJUSTMENTS },
  effects: { ...DEFAULT_EFFECT_ADJUSTMENTS },
  hsl: JSON.parse(JSON.stringify(DEFAULT_HSL_ADJUSTMENTS)),
  curve: JSON.parse(JSON.stringify(DEFAULT_TONE_CURVE)),
  detail: { ...DEFAULT_DETAIL_ADJUSTMENTS },
  optics: { ...DEFAULT_OPTICS_ADJUSTMENTS },
};

const INITIAL_IMAGE_STATE: ImageState = {
  file: null,
  imageUrl: null,
  thumbnailUrl: null,
  width: 0,
  height: 0,
  isLoaded: false,
  isLoading: false,
  error: null,
};

const INITIAL_PAN: PanState = { x: 0, y: 0 };

export const useEditorStore = create<EditorState>((set, get) => ({
  activeSection: "develop",
  mode: "develop",
  zoom: 100,
  isBeforeAfter: false,
  isLibraryOpen: true,
  isRightPanelOpen: true,
  isProcessing: false,
  theme: "dark" as ThemeMode,
  activePresetId: "original",

  // Design Canvas & Document State
  objects: [],
  selectedObjectIds: [],
  activeTool: "select",
  documentPreset: DOCUMENT_PRESETS[0],
  documentBackground: {
    type: "solid",
    color: "#ffffff",
    opacity: 1,
  },

  // Overlays & Guides
  guides: [],
  grid: {
    visible: false,
    size: 10,
    snap: true,
  },
  smartGuides: true,
  snapSettings: {
    snapToGuides: true,
    snapToObjects: true,
    snapToCanvas: true,
    snapToGrid: true,
  },
  showRulers: false,
  showSafeArea: false,

  // Crop State
  cropState: {
    active: false,
    x: 0,
    y: 0,
    width: 1080,
    height: 1080,
    rotation: 0,
    aspectRatio: "Free",
  },

  // Clipboard State
  clipboard: [],

  image: { ...INITIAL_IMAGE_STATE },
  pan: { ...INITIAL_PAN },
  histogram: null,
  adjustments: JSON.parse(JSON.stringify(DEFAULT_EDITOR_ADJUSTMENTS)),

  history: [JSON.parse(JSON.stringify(DEFAULT_EDITOR_ADJUSTMENTS))],
  historyIndex: 0,

  setActiveSection: (section: EditorSection) =>
    set({ activeSection: section }),

  setMode: (mode: Mode) =>
    set({
      mode,
      activeSection: mode === "develop" ? "develop" : "design",
    }),

  setZoom: (zoomOrFn) =>
    set((state) => ({
      zoom:
        typeof zoomOrFn === "function"
          ? Math.min(400, Math.max(25, zoomOrFn(state.zoom)))
          : Math.min(400, Math.max(25, zoomOrFn)),
    })),

  zoomIn: () =>
    set((state) => ({
      zoom: Math.min(state.zoom + 25, 400),
    })),

  zoomOut: () =>
    set((state) => ({
      zoom: Math.max(state.zoom - 25, 25),
    })),

  resetZoom: () => set({ zoom: 100, pan: { x: 0, y: 0 } }),

  setPan: (panOrFn) =>
    set((state) => ({
      pan: typeof panOrFn === "function" ? panOrFn(state.pan) : panOrFn,
    })),

  resetPan: () => set({ pan: { x: 0, y: 0 } }),

  toggleBeforeAfter: () =>
    set((state) => ({ isBeforeAfter: !state.isBeforeAfter })),

  toggleLibrary: () =>
    set((state) => ({ isLibraryOpen: !state.isLibraryOpen })),

  toggleRightPanel: () =>
    set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  toggleTheme: () => set({ theme: "dark" }),

  // Design Tool & Object Actions
  setActiveTool: (tool: DesignTool) => set({ activeTool: tool }),

  setDocumentPreset: (preset: DocumentPreset) => set({ documentPreset: preset }),

  setCustomDocumentSize: (width: number, height: number, name = "Custom Canvas") => {
    const preset: DocumentPreset = {
      id: `custom_${Date.now()}`,
      name: `${name} (${width} × ${height})`,
      width: Math.max(100, Math.min(8000, width)),
      height: Math.max(100, Math.min(8000, height)),
      category: "Custom",
    };
    set({ documentPreset: preset });
  },

  setDocumentBackground: (bg: Partial<DocumentBackground>) => {
    set((state) => ({
      documentBackground: { ...state.documentBackground, ...bg },
    }));
    get().commitHistorySnapshot();
  },

  createNewProject: (preset: DocumentPreset, background?: DocumentBackground) => {
    const primary = get().objects.find((o) => o.id === "primary_photo");
    set({
      documentPreset: preset,
      documentBackground: background || { type: "solid", color: "#ffffff", opacity: 1 },
      objects: primary ? [primary] : [],
      selectedObjectIds: [],
      guides: [],
    });
    get().commitHistorySnapshot();
  },

  // Guides & Grid Actions
  addGuide: (type: "horizontal" | "vertical", position: number) => {
    const guide: Guide = {
      id: `guide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      position: Math.round(position),
    };
    set((state) => ({ guides: [...state.guides, guide] }));
  },

  removeGuide: (id: string) => {
    set((state) => ({ guides: state.guides.filter((g) => g.id !== id) }));
  },

  clearGuides: () => set({ guides: [] }),

  setGridSettings: (settings: Partial<GridSettings>) => {
    set((state) => ({ grid: { ...state.grid, ...settings } }));
  },

  toggleGrid: () => set((state) => ({ grid: { ...state.grid, visible: !state.grid.visible } })),

  setSmartGuides: (enabled: boolean) => set({ smartGuides: enabled }),

  setSnapSettings: (settings: Partial<SnapSettings>) => {
    set((state) => ({ snapSettings: { ...state.snapSettings, ...settings } }));
  },

  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),

  toggleSafeArea: () => set((state) => ({ showSafeArea: !state.showSafeArea })),

  // Crop & Transform Actions
  setCropState: (crop: Partial<CropState>) => {
    set((state) => ({ cropState: { ...state.cropState, ...crop } }));
  },

  startCrop: () => {
    const { documentPreset, activeTool } = get();
    if (activeTool === "crop") return;

    set({
      activeTool: "crop",
      cropState: {
        active: true,
        x: 0,
        y: 0,
        width: documentPreset.width,
        height: documentPreset.height,
        rotation: 0,
        aspectRatio: "Free",
      },
    });
  },

  applyCrop: () => {
    const { cropState, documentPreset, objects } = get();
    if (!cropState.active) return;

    const cropW = Math.round(cropState.width);
    const cropH = Math.round(cropState.height);

    const newPreset: DocumentPreset = {
      id: `crop_${Date.now()}`,
      name: `Cropped (${cropW} × ${cropH})`,
      width: cropW,
      height: cropH,
      category: "Custom",
    };

    // Adjust objects relative to crop origin
    const updatedObjects = objects.map((o) => ({
      ...o,
      x: o.x - cropState.x,
      y: o.y - cropState.y,
    }));

    set({
      documentPreset: newPreset,
      objects: updatedObjects as EditorObject[],
      activeTool: "select",
      cropState: { ...cropState, active: false },
    });

    get().commitHistorySnapshot();
  },

  cancelCrop: () => {
    set((state) => ({
      activeTool: "select",
      cropState: { ...state.cropState, active: false },
    }));
  },

  rotateActive: (direction: "left" | "right") => {
    const { selectedObjectIds, objects, updateObject } = get();
    const delta = direction === "left" ? -90 : 90;

    if (selectedObjectIds.length > 0) {
      selectedObjectIds.forEach((id) => {
        const obj = objects.find((o) => o.id === id);
        if (obj && !obj.locked) {
          const newRot = (obj.rotation + delta + 360) % 360;
          updateObject(id, { rotation: newRot });
        }
      });
      get().commitHistorySnapshot();
    }
  },

  flipActive: (direction: "horizontal" | "vertical") => {
    const { selectedObjectIds, objects, updateObject } = get();
    if (selectedObjectIds.length === 0) return;

    selectedObjectIds.forEach((id) => {
      const obj = objects.find((o) => o.id === id);
      if (obj && obj.type === "image" && !obj.locked) {
        const imgObj = obj as ImageObject;
        if (direction === "horizontal") {
          updateObject(id, { flipH: !imgObj.flipH } as Partial<EditorObject>);
        } else {
          updateObject(id, { flipV: !imgObj.flipV } as Partial<EditorObject>);
        }
      }
    });
    get().commitHistorySnapshot();
  },

  // Clipboard & Object Movement Actions
  copySelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    if (selectedObjectIds.length === 0) return;
    const selected = objects.filter((o) => selectedObjectIds.includes(o.id));
    set({ clipboard: JSON.parse(JSON.stringify(selected)) });
  },

  pasteObjects: () => {
    const { clipboard, objects } = get();
    if (clipboard.length === 0) return;

    let maxZ = objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
    const newObjects: EditorObject[] = [];
    const newIds: string[] = [];

    clipboard.forEach((o) => {
      maxZ++;
      const newId = `obj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      newIds.push(newId);
      newObjects.push({
        ...o,
        id: newId,
        name: `${o.name} (Copy)`,
        x: o.x + 20,
        y: o.y + 20,
        zIndex: maxZ,
      } as EditorObject);
    });

    set({
      objects: [...objects, ...newObjects],
      selectedObjectIds: newIds,
    });
    get().commitHistorySnapshot();
  },

  cutSelectedObjects: () => {
    get().copySelectedObjects();
    get().deleteSelectedObjects();
  },

  moveSelectedObjectsByArrow: (dx: number, dy: number) => {
    const { selectedObjectIds, objects, updateObject } = get();
    if (selectedObjectIds.length === 0) return;

    selectedObjectIds.forEach((id) => {
      const obj = objects.find((o) => o.id === id);
      if (obj && !obj.locked) {
        updateObject(id, { x: obj.x + dx, y: obj.y + dy });
      }
    });
  },

  addObject: (obj: EditorObject) => {
    set((state) => {
      const maxZ = state.objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
      const newObj = { ...obj, zIndex: maxZ + 1 };
      return {
        objects: [...state.objects, newObj],
        selectedObjectIds: [newObj.id],
      };
    });
    get().commitHistorySnapshot();
  },

  updateObject: (id: string, updates: Partial<EditorObject>) => {
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? ({ ...o, ...updates } as EditorObject) : o)),
    }));
  },

  updateObjects: (updatesMap: Record<string, Partial<EditorObject>>) => {
    set((state) => ({
      objects: state.objects.map((o) =>
        updatesMap[o.id] ? ({ ...o, ...updatesMap[o.id] } as EditorObject) : o
      ),
    }));
  },

  deleteSelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    if (selectedObjectIds.length === 0) return;

    set({
      objects: objects.filter((o) => !selectedObjectIds.includes(o.id) && !o.locked),
      selectedObjectIds: [],
    });
    get().commitHistorySnapshot();
  },

  duplicateSelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    if (selectedObjectIds.length === 0) return;

    const toDuplicate = objects.filter((o) => selectedObjectIds.includes(o.id));
    const newObjects: EditorObject[] = [];
    const newIds: string[] = [];

    let maxZ = objects.reduce((max, o) => Math.max(max, o.zIndex), 0);

    toDuplicate.forEach((o) => {
      maxZ++;
      const newId = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      newIds.push(newId);
      newObjects.push({
        ...o,
        id: newId,
        name: `${o.name} (Copy)`,
        x: o.x + 20,
        y: o.y + 20,
        zIndex: maxZ,
      } as EditorObject);
    });

    set({
      objects: [...objects, ...newObjects],
      selectedObjectIds: newIds,
    });
    get().commitHistorySnapshot();
  },

  setSelectedObjectIds: (ids: string[]) => set({ selectedObjectIds: ids }),

  toggleObjectSelection: (id: string) => {
    set((state) => {
      const exists = state.selectedObjectIds.includes(id);
      return {
        selectedObjectIds: exists
          ? state.selectedObjectIds.filter((i) => i !== id)
          : [...state.selectedObjectIds, id],
      };
    });
  },

  clearSelection: () => set({ selectedObjectIds: [] }),

  reorderObject: (id: string, direction: "up" | "down" | "top" | "bottom") => {
    const { objects } = get();
    const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex((o) => o.id === id);
    if (index === -1) return;

    if (direction === "up" && index < sorted.length - 1) {
      const temp = sorted[index].zIndex;
      sorted[index].zIndex = sorted[index + 1].zIndex;
      sorted[index + 1].zIndex = temp;
    } else if (direction === "down" && index > 0) {
      const temp = sorted[index].zIndex;
      sorted[index].zIndex = sorted[index - 1].zIndex;
      sorted[index - 1].zIndex = temp;
    } else if (direction === "top") {
      const maxZ = Math.max(...sorted.map((o) => o.zIndex));
      sorted[index].zIndex = maxZ + 1;
    } else if (direction === "bottom") {
      const minZ = Math.min(...sorted.map((o) => o.zIndex));
      sorted[index].zIndex = Math.max(0, minZ - 1);
    }

    set({ objects: sorted });
    get().commitHistorySnapshot();
  },

  groupSelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    if (selectedObjectIds.length < 2) return;

    const selected = objects.filter((o) => selectedObjectIds.includes(o.id));
    const minX = Math.min(...selected.map((o) => o.x));
    const minY = Math.min(...selected.map((o) => o.y));
    const maxX = Math.max(...selected.map((o) => o.x + o.width));
    const maxY = Math.max(...selected.map((o) => o.y + o.height));
    const maxZ = Math.max(...selected.map((o) => o.zIndex));

    const groupId = `group_${Date.now()}`;
    const groupObject: GroupObject = {
      id: groupId,
      name: `Group (${selected.length})`,
      type: "group",
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: maxZ,
      groupId: null,
      childIds: selected.map((o) => o.id),
    };

    const updatedObjects = objects.map((o) =>
      selectedObjectIds.includes(o.id) ? { ...o, groupId } : o
    );

    set({
      objects: [...updatedObjects, groupObject],
      selectedObjectIds: [groupId],
    });
    get().commitHistorySnapshot();
  },

  ungroupSelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    if (selectedObjectIds.length === 0) return;

    const groupObj = objects.find(
      (o) => selectedObjectIds.includes(o.id) && o.type === "group"
    ) as GroupObject | undefined;

    if (!groupObj) return;

    const updatedObjects = objects
      .filter((o) => o.id !== groupObj.id)
      .map((o) => (o.groupId === groupObj.id ? { ...o, groupId: null } : o));

    set({
      objects: updatedObjects,
      selectedObjectIds: groupObj.childIds,
    });
    get().commitHistorySnapshot();
  },

  alignSelectedObjects: (alignment) => {
    const { selectedObjectIds, objects, documentPreset } = get();
    if (selectedObjectIds.length === 0) return;

    const selected = objects.filter((o) => selectedObjectIds.includes(o.id));
    if (selected.length === 0) return;

    const docW = documentPreset.width;
    const docH = documentPreset.height;

    // Handle canvas-relative alignment options
    if (alignment === "canvasLeft" || alignment === "canvasRight" || alignment === "canvasCenter" ||
        alignment === "canvasTop" || alignment === "canvasBottom" || alignment === "canvasMiddle" ||
        alignment === "canvasBoth") {
      const updated = objects.map((o) => {
        if (!selectedObjectIds.includes(o.id)) return o;
        let newX = o.x;
        let newY = o.y;

        if (alignment === "canvasLeft") newX = 0;
        if (alignment === "canvasRight") newX = docW - o.width;
        if (alignment === "canvasCenter" || alignment === "canvasBoth") newX = (docW - o.width) / 2;

        if (alignment === "canvasTop") newY = 0;
        if (alignment === "canvasBottom") newY = docH - o.height;
        if (alignment === "canvasMiddle" || alignment === "canvasBoth") newY = (docH - o.height) / 2;

        return { ...o, x: Math.round(newX), y: Math.round(newY) };
      });
      set({ objects: updated });
      get().commitHistorySnapshot();
      return;
    }

    let targetValue = 0;
    if (alignment === "left") targetValue = Math.min(...selected.map((o) => o.x));
    else if (alignment === "right") targetValue = Math.max(...selected.map((o) => o.x + o.width));
    else if (alignment === "center") {
      const minX = Math.min(...selected.map((o) => o.x));
      const maxX = Math.max(...selected.map((o) => o.x + o.width));
      targetValue = (minX + maxX) / 2;
    } else if (alignment === "top") targetValue = Math.min(...selected.map((o) => o.y));
    else if (alignment === "bottom") targetValue = Math.max(...selected.map((o) => o.y + o.height));
    else if (alignment === "middle") {
      const minY = Math.min(...selected.map((o) => o.y));
      const maxY = Math.max(...selected.map((o) => o.y + o.height));
      targetValue = (minY + maxY) / 2;
    }

    const updated = objects.map((o) => {
      if (!selectedObjectIds.includes(o.id)) return o;
      let newX = o.x;
      let newY = o.y;

      if (alignment === "left") newX = targetValue;
      else if (alignment === "right") newX = targetValue - o.width;
      else if (alignment === "center") newX = targetValue - o.width / 2;
      else if (alignment === "top") newY = targetValue;
      else if (alignment === "bottom") newY = targetValue - o.height;
      else if (alignment === "middle") newY = targetValue - o.height / 2;

      return { ...o, x: Math.round(newX), y: Math.round(newY) };
    });

    set({ objects: updated });
    get().commitHistorySnapshot();
  },

  distributeSelectedObjects: (axis) => {
    const { selectedObjectIds, objects } = get();
    if (selectedObjectIds.length < 3) return;

    const selected = objects
      .filter((o) => selectedObjectIds.includes(o.id))
      .sort((a, b) => (axis === "horizontal" ? a.x - b.x : a.y - b.y));

    if (axis === "horizontal") {
      const minX = selected[0].x;
      const maxX = selected[selected.length - 1].x;
      const totalWidth = selected.reduce((sum, o) => sum + o.width, 0);
      const totalSpan = maxX - minX;
      const gap = (totalSpan - totalWidth) / (selected.length - 1);

      let currentX = minX;
      const posMap: Record<string, number> = {};
      selected.forEach((o) => {
        posMap[o.id] = currentX;
        currentX += o.width + gap;
      });

      set({
        objects: objects.map((o) => (posMap[o.id] !== undefined ? { ...o, x: posMap[o.id] } : o)),
      });
    } else {
      const minY = selected[0].y;
      const maxY = selected[selected.length - 1].y;
      const totalHeight = selected.reduce((sum, o) => sum + o.height, 0);
      const totalSpan = maxY - minY;
      const gap = (totalSpan - totalHeight) / (selected.length - 1);

      let currentY = minY;
      const posMap: Record<string, number> = {};
      selected.forEach((o) => {
        posMap[o.id] = currentY;
        currentY += o.height + gap;
      });

      set({
        objects: objects.map((o) => (posMap[o.id] !== undefined ? { ...o, y: posMap[o.id] } : o)),
      });
    }
    get().commitHistorySnapshot();
  },

  // Image Handling Action
  setImageFile: async (file: File) => {
    const currentUrl = get().image.imageUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    set({
      image: {
        ...INITIAL_IMAGE_STATE,
        file,
        isLoading: true,
      },
      isProcessing: true,
    });

    try {
      const loaded = await loadImageFromFile(file);
      const primaryPhotoObj: ImageObject = {
        id: "primary_photo",
        name: "Primary Photo",
        type: "image",
        src: loaded.url,
        x: (get().documentPreset.width - Math.min(800, loaded.width)) / 2,
        y: (get().documentPreset.height - Math.min(800, loaded.height)) / 2,
        width: Math.min(800, loaded.width),
        height: Math.min(800, loaded.height),
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 1,
        groupId: null,
        clipFrame: "none",
        aspectRatio: loaded.width / loaded.height,
      };

      set({
        image: {
          file,
          imageUrl: loaded.url,
          thumbnailUrl: loaded.thumbnailUrl,
          width: loaded.width,
          height: loaded.height,
          isLoaded: true,
          isLoading: false,
          error: null,
        },
        objects: [primaryPhotoObj],
        selectedObjectIds: ["primary_photo"],
        zoom: 100,
        pan: { x: 0, y: 0 },
        activePresetId: "original",
        adjustments: JSON.parse(JSON.stringify(DEFAULT_EDITOR_ADJUSTMENTS)),
        history: [JSON.parse(JSON.stringify(DEFAULT_EDITOR_ADJUSTMENTS))],
        historyIndex: 0,
        isProcessing: false,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load image.";
      set({
        image: {
          ...INITIAL_IMAGE_STATE,
          error: message,
          isLoading: false,
        },
        isProcessing: false,
      });
    }
  },

  clearImage: () => {
    const currentUrl = get().image.imageUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    set({
      image: { ...INITIAL_IMAGE_STATE },
      objects: [],
      selectedObjectIds: [],
      histogram: null,
      activePresetId: "original",
      adjustments: JSON.parse(JSON.stringify(DEFAULT_EDITOR_ADJUSTMENTS)),
      history: [JSON.parse(JSON.stringify(DEFAULT_EDITOR_ADJUSTMENTS))],
      historyIndex: 0,
    });
  },

  setImageError: (error: string | null) =>
    set((state) => ({
      image: { ...state.image, error, isLoading: false },
    })),

  setHistogramData: (data: HistogramData) => set({ histogram: data }),

  setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),

  // Granular Adjustment Setters
  setBasicAdjustment: (key, value) => {
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        basic: {
          ...state.adjustments.basic,
          [key]: value,
        },
      },
    }));
  },

  setColorAdjustment: (key, value) => {
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        color: {
          ...state.adjustments.color,
          [key]: value,
        },
      },
    }));
  },

  setEffectAdjustment: (key, value) => {
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        effects: {
          ...state.adjustments.effects,
          [key]: value,
        },
      },
    }));
  },

  setHSLAdjustment: (channel, property, value) => {
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        hsl: {
          ...state.adjustments.hsl,
          [channel]: {
            ...state.adjustments.hsl[channel],
            [property]: value,
          },
        },
      },
    }));
  },

  setCurvePoints: (channel: ToneCurveChannel, points: CurvePoint[]) => {
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        curve: {
          ...state.adjustments.curve,
          [channel]: points,
        },
      },
    }));
  },

  setDetailAdjustment: (key, value) => {
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        detail: {
          ...state.adjustments.detail,
          [key]: value,
        },
      },
    }));
  },

  setOpticsAdjustment: (key, value) => {
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        optics: {
          ...state.adjustments.optics,
          [key]: value,
        },
      },
    }));
  },

  resetSection: (section) => {
    const current = get().adjustments;
    let updated: EditorAdjustments;

    if (section === "basic") {
      updated = { ...current, basic: { ...DEFAULT_BASIC_ADJUSTMENTS } };
    } else if (section === "color") {
      updated = { ...current, color: { ...DEFAULT_COLOR_ADJUSTMENTS } };
    } else if (section === "effects") {
      updated = { ...current, effects: { ...DEFAULT_EFFECT_ADJUSTMENTS } };
    } else if (section === "hsl") {
      updated = { ...current, hsl: JSON.parse(JSON.stringify(DEFAULT_HSL_ADJUSTMENTS)) };
    } else if (section === "curve") {
      updated = { ...current, curve: JSON.parse(JSON.stringify(DEFAULT_TONE_CURVE)) };
    } else if (section === "detail") {
      updated = { ...current, detail: { ...DEFAULT_DETAIL_ADJUSTMENTS } };
    } else {
      updated = { ...current, optics: { ...DEFAULT_OPTICS_ADJUSTMENTS } };
    }

    set({ adjustments: updated });
    get().commitHistorySnapshot();
  },

  resetAllAdjustments: () => {
    set({
      activePresetId: "original",
      adjustments: JSON.parse(JSON.stringify(DEFAULT_EDITOR_ADJUSTMENTS)),
    });
    get().commitHistorySnapshot();
  },

  applyPreset: (presetId, presetAdjustments) => {
    set({
      activePresetId: presetId,
      adjustments: JSON.parse(JSON.stringify(presetAdjustments)),
    });
    get().commitHistorySnapshot();
  },

  // History Actions
  commitHistorySnapshot: () => {
    const state = get();
    const currentAdj = state.adjustments;
    const history = state.history.slice(0, state.historyIndex + 1);

    const lastHistory = history[history.length - 1];
    if (lastHistory && JSON.stringify(lastHistory) === JSON.stringify(currentAdj)) {
      return;
    }

    const newHistory = [...history, JSON.parse(JSON.stringify(currentAdj))];
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetAdjustments = history[targetIndex];
      set({
        adjustments: JSON.parse(JSON.stringify(targetAdjustments)),
        historyIndex: targetIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetAdjustments = history[targetIndex];
      set({
        adjustments: JSON.parse(JSON.stringify(targetAdjustments)),
        historyIndex: targetIndex,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
