"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Brain, 
  Plus, 
  ArrowRight, 
  Image as ImageIcon, 
  Maximize2, 
  Search,
  Settings,
  Grid,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  Tag,
  Building,
  Activity,
  Zap,
  ShieldCheck,
  Package,
  Calendar,
  Layers,
  BarChart3,
  Clock,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CategoryBadge = ({ text, active }: { text: string; active?: boolean }) => (
    <button className="px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all border">
        {text}
    </button>
);

export default function GalleryAdminPage() {
  const { isDark } = useTheme();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/gallery/projects");
        if (!res.ok) {
          throw new Error(`Failed to fetch gallery projects: ${res.status}`);
        }
        const data = await res.json();
        setItems(data.projects || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const categories = ["ALL", "LOBBY", "SUITE", "WELLNESS", "DINING", "EXTERIOR"];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505]">
      <Loader2 className="w-10 h-10 animate-spin text-amber-500/20 mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Loading Visual Assets...</span>
    </div>
  );

  return (
    <main className="min-h-screen pt-6 pb-20 px-6 sm:px-12 theme-transition ">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Navigation / Metadata */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                <ArrowLeft className="w-3 h-3" /> Executive Overview
            </Link>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Assets Online: {items.length}</span>
                </div>
            </div>
        </div>

        <section className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-end">
            <div className="space-y-8">
                <h1 className="font-serif text-6xl md:text-8xl italic tracking-tight lowercase mb-8">
                    Gallery <span className="text-zinc-500">Curator</span>
                </h1>
                <p className="max-w-xl text-base md:text-lg text-neutral-400 font-medium leading-relaxed">
                    "Managing the visual identity of the property. Every image is a window into the experience we provide for our guests."
                </p>
            </div>
            
            <div className="flex flex-col gap-8 lg:items-end">
                <div className="flex flex-wrap gap-3 justify-end">
                    {categories.map(cat => (
                        <CategoryBadge key={cat} text={cat} active={activeCategory === cat} />
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 ">
                        <Plus className="w-4 h-4" /> Upload Media
                    </button>
                    <button className="p-5 rounded-full border ">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
                {items.filter(i => activeCategory === "ALL" || i.category === activeCategory).map((item, idx) => (
                    <motion.div 
                        layout 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={item._id || `${item.category}-${idx}`} 
                        className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl"
                    >
                        <img 
                            src={item.src} 
                            alt={item.alt} 
                            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="space-y-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500">{item.category}</p>
                                <h3 className="text-3xl font-serif italic">{item.alt}</h3>
                                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                    <button className="p-4 rounded-full bg-white text-black hover:bg-amber-500 transition-colors shadow-2xl">
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                    <button className="text-sm italic opacity-60 hover:opacity-100 transition-opacity underline decoration-amber-500 font-medium capitalize">
                                        edit metadata
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Intelligence Overlay */}
        <div className="mt-32 p-1 rounded-[4rem] border border-amber-500/10 bg-amber-500/5 backdrop-blur-3xl">
            <div className="p-16 flex flex-col md:flex-row items-center gap-12">
                <div className="p-8 rounded-full bg-amber-500 text-black shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                    <Brain className="w-10 h-10" />
                </div>
                <div className="flex-1 space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-500 italic">Neural Vision Alert</h3>
                    <p className="text-2xl font-serif italic max-w-2xl">
                        Analytics suggest that updating the <span className="text-white underline decoration-zinc-700 underline-offset-8">Lobby</span> imagery to reflect the current season could increase booking conversion by up to 14%.
                    </p>
                </div>
                <button className="px-12 py-6 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl">
                    Generate Task
                </button>
            </div>
        </div>

      </div>
    </main>
  );
}
