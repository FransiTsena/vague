"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  Building, 
  QrCode, 
  Tag, 
  Shield, 
  Layers, 
  Search, 
  Plus 
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CategoryBadge = ({ text }: { text: string }) => (
    <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400">
        {text}
    </div>
);

export default function ProvenanceAdminPage() {
  const { isDark } = useTheme();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/provenance");
        const json = await res.json();
        // The API returns { success: true, data: [...] }
        setItems(json.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505]">
      <Loader2 className="w-10 h-10 animate-spin text-amber-500/20 mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Verifying Identity Chains...</span>
    </div>
  );

  return (
    <main className={`min-h-screen pt-24 pb-20 px-6 sm:px-12 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex items-center justify-between mb-12">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                <ArrowLeft className="w-3 h-3" /> Executive Overview
            </Link>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Chain Integrity Check: 100%</span>
                </div>
            </div>
        </div>

        <section className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-end">
            <div>
                <h1 className="font-serif text-6xl md:text-8xl italic tracking-tight lowercase mb-8">
                    Asset <span className="text-zinc-500">Provenance</span>
                </h1>
                <p className="max-w-xl text-base md:text-lg text-neutral-400 font-medium leading-relaxed italic">
                    "Each object in the property contains a story. We ensure that story is verified, digitized, and accessible via secure QR identity tokens."
                </p>
            </div>
            
            <div className="flex flex-col gap-6 lg:items-end">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                    <input 
                        type="text" 
                        placeholder="Search Asset ID or Name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full pl-14 pr-8 py-5 rounded-full border bg-transparent text-sm font-bold tracking-widest transition-all outline-none hover:bg-white/[0.03] ${isDark ? "border-white/10" : "border-black/10 shadow-none"}`}
                    />
                </div>
                <button className={`px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 ${isDark ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-black text-white hover:bg-neutral-800 focus:scale-[0.98] shadow-2xl"}`}>
                    <Plus className="w-4 h-4" /> Mint New Identity Tag
                </button>
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                    <motion.div 
                        layout 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, perspective: 1000, rotateX: -20, scale: 0.9 }}
                        key={item.id || item._id || `asset-${item.name}-${Math.random()}`} 
                        className={`p-10 rounded-[3rem] border group hover:border-amber-500/40 transition-all duration-700 ${isDark ? "bg-white/5 border-white/10 shadow-2xl" : "bg-white border-black/5 shadow-xl"}`}
                    >
                        <div className="flex items-start justify-between mb-10">
                            <div className="p-4 rounded-3xl bg-amber-500 text-black shadow-2xl shadow-amber-500/20">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 italic">Product SKU</p>
                                <p className="text-[11px] font-mono tracking-widest">
                                    {(item.id || item._id || "ASSET-000").slice(-8).toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3">
                                <CategoryBadge text={item.category} />
                                <CategoryBadge text={item.location || "Public Area"} />
                            </div>
                            <h3 className="text-3xl font-serif italic group-hover:text-amber-500 transition-colors duration-500 cursor-pointer">{item.name}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed font-medium line-clamp-2">{item.description}</p>
                        </div>

                        <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 group-hover:gap-4 transition-all">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified</span>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all italic">
                                Configuration Protocol <ChevronRight className="w-3 h-3 inline ml-1" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        <div className="mt-20 flex flex-wrap gap-4 items-center justify-center">
            {['Public Areas', 'Guest Chambers', 'Staff Terminals', 'Spa Facilities'].map(loc => (
                <button key={loc} className={`px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${isDark ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-black/5 shadow-2xl"}`}>
                    Batch Update: {loc}
                </button>
            ))}
        </div>

      </div>
    </main>
  );
}
