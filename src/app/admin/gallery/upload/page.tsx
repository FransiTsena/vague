"use client";

import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Upload, Image as ImageIcon, Plus } from "lucide-react";
import Link from "next/link";

export default function MediaUploadPage() {
  const { isDark } = useTheme();
  return (
    <main className={`min-h-screen pb-20 pt-8 md:pt-12 px-6 sm:px-12 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="max-w-7xl mx-auto">
        <Link href="/admin/gallery" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 mb-8 transition-opacity">
          <ArrowLeft className="w-3 h-3" /> Media Overview
        </Link>
        
        <div className="mb-16 border-b border-neutral-100 dark:border-white/10 pb-8">
          <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight mb-4 lowercase first-letter:uppercase">
            High-Fidelity <span className="italic text-neutral-400 dark:text-neutral-500">Ingestion</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-xs md:text-sm leading-relaxed font-light">
            Secure media asset ingestion pipeline for property visual records and architectural documentation.
          </p>
        </div>

        <div className={`border-2 border-dashed aspect-video flex flex-col items-center justify-center p-12 transition-all duration-700 ${isDark ? "bg-white/5 border-white/10 hover:border-white/30" : "bg-neutral-50 border-neutral-200 hover:border-neutral-400 text-neutral-400"}`}>
           <div className="p-8 bg-neutral-900/5 dark:bg-white/5 border border-black/5 dark:border-white/5 mb-8">
              <Upload className="w-8 h-8 opacity-40" />
           </div>
           <p className="text-[10px] font-mono tracking-[0.4em] uppercase mb-4">Drop High-Resolution Assets</p>
           <p className="text-[10px] font-light italic opacity-40 mb-12">Support for 8K RAW, TIFF, and Digital Architecture Files</p>
           <button className={`px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all border ${
             isDark ? "bg-white text-black border-white" : "bg-black text-white border-black"
           }`}>
              Select from Filesystem
           </button>
        </div>
      </div>
    </main>
  );
}
