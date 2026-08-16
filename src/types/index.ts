/**
 * PixelRaw Core Type Definitions
 * Shared types across studio stores, components, and hooks.
 */

export type StudioViewMode = "landing" | "editor" | "library";

export type SystemStatus = "ready" | "loading" | "error";

export interface StudioConfig {
  appName: string;
  version: string;
  tagline: string;
  activeMode: StudioViewMode;
  engineStatus: SystemStatus;
}

export interface UserPreferences {
  theme: "dark";
  compactUi: boolean;
  showHistogram: boolean;
}
