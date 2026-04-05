"use client";

import Link from "next/link";
import { ArrowUpRight, QrCode, GalleryHorizontalEnd, LayoutDashboard, Users, Activity, Grid3X3, TrendingUp } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const adminCards = [
  {
    href: "/admin/analytics",
    title: "Revenue & Intelligence",
    description: "Access executive-level guest intelligence, dynamic pricing models, and occupancy forecasting trajectories.",
    icon: LayoutDashboard,
    tag: "Analytics"
  },
  {
    href: "/admin/scheduling",
    title: "Personnel Orchestration",
    description: "Manage workforce dynamics, shift allocations, and organizational efficiency across all property departments.",
    icon: Users,
    tag: "Staffing"
  },
  {
    href: "/admin/provenance",
    title: "Digital Archive Admin",
    description: "Curate the provenance database, generate secure QR signatures, and manage artisanal heritage records.",
    icon: QrCode,
    tag: "Collection"
  },
  {
    href: "/admin/gallery",
    title: "Curation & Media",
    description: "Maintain the visual narrative of the property through high-fidelity media management and project showcases.",
    icon: GalleryHorizontalEnd,
    tag: "Creative"
  },
];

export default function AdminHomePage() {
  const { isDark } = useTheme();

  return (
    <main className={`min-h-[calc(100vh-160px)] theme-transition ${isDark ? "bg-black text-white" : "bg-white text-neutral-900"} pt-4 md:pt-8`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-12 pt-2 md:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-white/10 pb-8 mb-8 md:mb-10">
          <div className="max-w-4xl space-y-3">
            <div className="flex items-center gap-2">
               <div className="h-[1px] w-6 bg-neutral-400 opacity-50" />
               <span className="text-[9px] uppercase font-mono tracking-[0.4em] text-neutral-400">Executive Console</span>
            </div>
            <h1 className="font-serif text-3xl leading-[1.1] md:text-5xl font-light tracking-tight">
              Unified <span className="italic text-neutral-400 dark:text-neutral-500">Property</span> Management
            </h1>
            <p className="max-w-xl text-xs leading-relaxed font-light text-neutral-500 dark:text-neutral-400">
              Core infrastructure synchronized. Use the navigation hierarchy to orchestrate property assets.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 font-mono">
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-full">
              <Activity className="w-2.5 h-2.5 animate-pulse" />
              <span className="text-[7px] font-bold tracking-[0.2em]">SYSTEM ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Quick Insights Row - New Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
           <div className={`p-4 border transition-all duration-500 ${isDark ? "bg-white/5 border-white/10 hover:bg-white/[0.07]" : "bg-neutral-50 border-neutral-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-1 rounded-md bg-sky-500/10 text-sky-500"><Activity className="w-3 h-3" /></div>
                 <span className="text-[8px] font-bold tracking-widest text-neutral-400 uppercase">Live Occupancy</span>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-serif">84%</span>
                 <span className="text-[9px] text-emerald-500 font-mono">+12.4%</span>
              </div>
           </div>
           
           <div className={`p-4 border transition-all duration-500 ${isDark ? "bg-white/5 border-white/10 hover:bg-white/[0.07]" : "bg-neutral-50 border-neutral-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-1 rounded-md bg-amber-500/10 text-amber-500"><TrendingUp className="w-3 h-3" /></div>
                 <span className="text-[8px] font-bold tracking-widest text-neutral-400 uppercase">Daily Revenue</span>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-serif">€14.2k</span>
                 <span className="text-[9px] text-emerald-500 font-mono">+4.2%</span>
              </div>
           </div>

           <div className={`p-4 border transition-all duration-500 ${isDark ? "bg-white/5 border-white/10 hover:bg-white/[0.07]" : "bg-neutral-50 border-neutral-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500"><Users className="w-3 h-3" /></div>
                 <span className="text-[8px] font-bold tracking-widest text-neutral-400 uppercase">Staff Active</span>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-serif">42</span>
                 <span className="text-[9px] text-neutral-400 font-mono">Full Capacity</span>
              </div>
           </div>
        </div>

        {/* Admin Navigation Grid - Modern Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative flex flex-col p-10 transition-all duration-700 rounded-lg border shadow-sm ${
                  isDark 
                    ? "bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900" 
                    : "bg-neutral-50/50 border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 border border-neutral-100 dark:border-white/10 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Icon className="w-4 h-4 font-light" />
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 transition-opacity">
                      {card.tag}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500" />
                </div>

                <div className="space-y-3">
                  <h2 className="font-serif text-2xl md:text-3xl font-light tracking-tight group-hover:italic transition-all duration-500">
                    {card.title}
                  </h2>
                  <p className="text-xs leading-relaxed font-light text-neutral-500 dark:text-neutral-400 max-w-sm">
                    {card.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-4 text-[9px] font-bold tracking-[0.3em] uppercase opacity-30 overflow-hidden">
                  <span className="whitespace-nowrap transition-transform duration-700 group-hover:translate-x-3">Enter Suite</span>
                  <div className="h-[1px] w-full bg-current transition-transform duration-700 -translate-x-full group-hover:translate-x-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Global Stats Bar */}
        <div className="flex flex-col md:flex-row gap-8 justify-between border-t border-neutral-100 dark:border-white/10 pt-12 mt-12 opacity-60">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <p className="text-[8px] font-bold tracking-[0.3em] uppercase">Active Nodes</p>
              <p className="text-xs font-mono tracking-tighter italic">V-01. V-02. V-04</p>
            </div>
            <div className="w-[1px] h-6 bg-neutral-200 dark:bg-white/10" />
            <div className="space-y-1">
              <p className="text-[8px] font-bold tracking-[0.3em] uppercase">Auth Level</p>
              <p className="text-xs font-mono tracking-tighter uppercase">Root Executive</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Grid3X3 className="w-3 h-3" />
             <span className="text-[10px] tracking-[0.4em] font-medium uppercase">VAGUE HMS OS v2.0</span>
          </div>
        </div>
      </div>
    </main>
  );
}
