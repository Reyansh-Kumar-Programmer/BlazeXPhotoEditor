"use client";

import React from "react";
import { Sparkles, ArrowRight, CheckCircle2, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { useStudio } from "@/hooks/useStudio";

export function LandingScreen() {
  const { config, openEditor } = useStudio();

  return (
    <div
      data-theme="dark"
      className="min-h-screen w-full flex flex-col justify-between font-sans"
      style={{ backgroundColor: "#0d0e12", color: "#e5e5e5" }}
    >
      <header className="h-12 px-6 flex items-center justify-between z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(20,21,25,0.9)" }}>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded bg-white flex items-center justify-center text-black shadow-sm">
            <Sparkles className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-tight text-sm text-white font-mono">
              Pixel<span className="text-neutral-500 font-normal">Raw</span>
            </span>
            <span className="text-[10px] text-neutral-600 font-mono">v{config.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Engine Ready
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 z-10">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white shadow-xl">
            <SlidersHorizontal className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Pixel<span className="text-neutral-500">Raw</span>
            </h1>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
              {config.tagline}
            </p>
          </div>
          <button
            onClick={openEditor}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition-all shadow-lg active:scale-[0.98]"
          >
            Open Editor
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <span className="text-[11px] text-neutral-600 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Non-destructive editing architecture
          </span>
        </div>
      </main>

      <footer className="h-9 px-6 flex items-center justify-between text-[11px] text-neutral-600 font-mono z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-neutral-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Shell Mounted
          </span>
        </div>
        <span>PixelRaw &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
