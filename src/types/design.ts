import { EditorAdjustments } from "./editor";

export type EditorObjectType = "image" | "text" | "shape" | "group";

export interface BaseEditorObject {
  id: string;
  name: string;
  type: EditorObjectType;

  x: number;
  y: number;

  width: number;
  height: number;

  rotation: number; // in degrees (0..360)
  opacity: number;  // 0..1

  visible: boolean;
  locked: boolean;

  zIndex: number;
  groupId: string | null;
  aspectRatioLocked?: boolean;
}

export type ClipFrameType = "none" | "rectangle" | "rounded" | "circle";

export interface ImageObject extends BaseEditorObject {
  type: "image";
  src: string;
  clipFrame: ClipFrameType;
  aspectRatio: number;
  adjustments?: EditorAdjustments;
  flipH?: boolean;
  flipV?: boolean;
}

export interface TextObject extends BaseEditorObject {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;

  textAlign: "left" | "center" | "right";
  letterSpacing: number; // in px
  lineHeight: number;    // relative multiplier (e.g. 1.2)

  italic: boolean;
  underline: boolean;

  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;

  strokeColor?: string;
  strokeWidth?: number;
}

export type ShapeType =
  | "rectangle"
  | "rounded-rectangle"
  | "circle"
  | "ellipse"
  | "triangle"
  | "line"
  | "star";

export interface GradientFill {
  type: "linear" | "radial";
  color1: string;
  color2: string;
  angle: number; // 0..360
}

export interface ShapeObject extends BaseEditorObject {
  type: "shape";
  shapeType: ShapeType;

  fill: string; // HEX / RGBA or gradient string
  gradientFill?: GradientFill;

  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
}

export interface GroupObject extends BaseEditorObject {
  type: "group";
  childIds: string[];
}

export type EditorObject = ImageObject | TextObject | ShapeObject | GroupObject;

export type DesignTool = "select" | "text" | "shape" | "image" | "crop";

export interface DocumentBackground {
  type: "solid" | "gradient" | "transparent";
  color: string;
  color2?: string;
  angle?: number;
  opacity?: number;
}

export interface Guide {
  id: string;
  type: "horizontal" | "vertical";
  position: number; // in document pixels
}

export interface GridSettings {
  visible: boolean;
  size: number; // 5, 10, 20, 50
  snap: boolean;
}

export interface SnapSettings {
  snapToGuides: boolean;
  snapToObjects: boolean;
  snapToCanvas: boolean;
  snapToGrid: boolean;
}

export type CropRatioPreset =
  | "Free"
  | "Original"
  | "1:1"
  | "4:5"
  | "3:2"
  | "4:3"
  | "16:9"
  | "9:16"
  | "2:3";

export interface CropState {
  active: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees -45..45
  aspectRatio: CropRatioPreset;
}

export interface DocumentPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: "Social" | "Video" | "Social / Professional" | "Print" | "Custom";
}

export const DOCUMENT_PRESETS: DocumentPreset[] = [
  { id: "insta_post", name: "Instagram Post (1080 × 1080)", width: 1080, height: 1080, category: "Social" },
  { id: "insta_portrait", name: "Instagram Portrait (1080 × 1350)", width: 1080, height: 1350, category: "Social" },
  { id: "insta_story", name: "Instagram Story (1080 × 1920)", width: 1080, height: 1920, category: "Social" },
  { id: "yt_thumb", name: "YouTube Thumbnail (1280 × 720)", width: 1280, height: 720, category: "Video" },
  { id: "yt_video", name: "YouTube (1920 × 1080)", width: 1920, height: 1080, category: "Video" },
  { id: "linkedin_post", name: "LinkedIn Post (1200 × 627)", width: 1200, height: 627, category: "Social / Professional" },
  { id: "x_post", name: "X Post (1600 × 900)", width: 1600, height: 900, category: "Social / Professional" },
  { id: "poster_a4", name: "Poster A4 (1240 × 1754)", width: 1240, height: 1754, category: "Print" },
];

export const CURATED_FONTS = [
  { name: "Inter", family: "Inter, sans-serif" },
  { name: "Poppins", family: "Poppins, sans-serif" },
  { name: "Roboto", family: "Roboto, sans-serif" },
  { name: "Montserrat", family: "Montserrat, sans-serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Lora", family: "Lora, serif" },
  { name: "Oswald", family: "Oswald, sans-serif" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif" },
];
