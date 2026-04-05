"use client";

import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, QrCode, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function CollectionRecordsPage() {
  const { isDark } = useTheme();
  return (
    <main className={`min-h-screen pb-20 pt-8 md:pt-12 px-6 sm:px-12 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="max-w-7xl mx-auto">
        <Link href="/admin/provenance" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 mb-8 transition-opacity">
          <ArrowLeft className="w-3 h-3" /> Provenance Overview
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-neutral-100 dark:border-white/10 pb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight mb-4 lowercase first-letter:uppercase">
              Property <span className="italic text-neutral-400 dark:text-neutral-500">Collection</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-xs md:text-sm leading-relaxed font-light">
              Digital twin records for architectural assets, artisanal heritage pieces, and property-specific artifacts.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                <input type="text" placeholder="Search Archives..." className={`bg-transparent border border-black/10 dark:border-white/10 px-12 py-3 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-neutral-400 transition-colors`} />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3, 4, 5, 6].map((i) => (
             <div key={i} className={`p-8 border aspect-square flex flex-col justify-between group transition-all duration-700 ${isDark ? "bg-white/5 border-white/5 hover:border-white/20" : "bg-neutral-50 border-neutral-100 hover:border-neutral-300"}`}>
                <div className="flex justify-between items-start">
                   <div className="bg-emerald-500/10 text-emerald-500 p-2 border border-emerald-500/10">
                      <QrCode className="w-4 h-4" />
                   </div>
                   <span className="text-[10px] font-mono tracking-[0.4em] uppercase opacity-30">#ARCH-PR-{i}284</span>
                </div>
                <div>
                   <h3 className="font-serif text-2xl font-light tracking-tight group-hover:italic transition-all duration-500">Artisanal Murano Sculpture</h3>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-light">Floor 4, Lounge A1. Original piece from the property curation.</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </main>
  );
}
