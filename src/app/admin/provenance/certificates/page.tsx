"use client";

import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, ShieldCheck, Download, Plus } from "lucide-react";
import Link from "next/link";

export default function DigitalCertificatesPage() {
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
              Digital <span className="italic text-neutral-400 dark:text-neutral-500">Signatures</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-xs md:text-sm leading-relaxed font-light">
              Cryptographically signed certificates of provenance for property assets and heritage collections.
            </p>
          </div>
          <button className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] transition-all border ${
            isDark ? "bg-white text-black border-white hover:bg-transparent hover:text-white" : "bg-black text-white border-black hover:bg-transparent hover:text-black"
          }`}>
             New Signature
          </button>
        </div>

        <div className="space-y-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className={`p-8 border transition-all duration-500 flex items-center justify-between ${isDark ? "bg-white/5 border-white/5" : "bg-neutral-50 border-neutral-100"}`}>
                <div className="flex items-center gap-8">
                   <div className="p-4 bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                      <ShieldCheck className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="font-serif text-2xl font-light tracking-tight">Main Lobby Arch — Block Sigma</h3>
                      <p className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 mt-1">Signed by EXEC_AUTH_ROOT • 05/APR/2026</p>
                   </div>
                </div>
                <button className="flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                   <Download className="w-3 h-3" /> Verify & Download
                </button>
             </div>
           ))}
        </div>
      </div>
    </main>
  );
}
