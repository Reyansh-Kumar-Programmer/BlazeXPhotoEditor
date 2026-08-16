"use client";

import React from "react";
import { EditorShell } from "@/components/editor/EditorShell";
import { LandingScreen } from "@/components/editor/LandingScreen";
import { useStudio } from "@/hooks/useStudio";

export default function HomePage() {
  const { activeMode } = useStudio();

  if (activeMode === "landing") {
    return <LandingScreen />;
  }

  return <EditorShell />;
}
