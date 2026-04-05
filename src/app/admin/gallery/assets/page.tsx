"use client";

import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Grid3X3, List, Search } from "lucide-react";
import Link from "next/link";

export default function AssetLibraryPage() {
  const { isDark } = useTheme();
  return (
    <main className={`min-h-screen pb-20 pt-8 md:pt-12 px-6 sm:px-12 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="max-w-7xl mx-auto">
        <Link href="/admin/gallery" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 mb-8 transition-opacity">
          <ArrowLeft className="w-3 h-3" /> Media Overview
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-neutral-100 dark:border-white/10 pb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight mb-4 lowercase first-letter:uppercase">
              Asset <span className="italic text-neutral-400 dark:text-neutral-500">Repository</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-xs md:text-sm leading-relaxed font-light">
              Managed library of property visualization assets, architectural renderings, and creative archives.
            </p>
          </div>
          <div className="flex items-center gap-4 border border-black/10 dark:border-white/10 p-1">
             <button className="p-2 bg-black dark:bg-white text-white dark:text-black">
                <Grid3X3 className="w-4 h-4" />
             </button>
             <button className="p-2 opacity-30 hover:opacity-100">
                <List className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
             <div key={i} className={`group aspect-square border overflow-hidden transition-all duration-700 ${isDark ? "border-white/10" : "border-neutral-100"}`}>
                <div className="w-full h-full bg-neutral-900/10 transition-all duration-1000 group-hover:scale-110 flex items-center justify-center italic text-[10px] opacity-20">
                   IMG_REF_00{i}
                </div>
             </div>
           ))}
        </div>
      </div>
    </main>
  );
}
