"use client";

import PricingDemo from "@/components/sections/PricingDemo";
import OccupancyAnalytics from "@/components/sections/OccupancyAnalytics";
import GuestIntelligence from "@/components/sections/GuestIntelligence";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { Calendar, TrendingUp, Activity, ShieldCheck } from "lucide-react";

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  return (
    <main className={`min-h-screen theme-transition pb-32 ${isDark ? "bg-black text-white" : "bg-white text-black"} pt-12 md:pt-20 uppercase tracking-widest`}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-20 md:mb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-neutral-100 dark:border-white/10 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 opacity-50">
              <Activity className="w-3 h-3" />
              <span className="text-[10px] font-bold tracking-[0.4em]">Intelligence Suite</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight lowercase first-letter:uppercase">
              Revenue & <span className="italic text-neutral-400 dark:text-neutral-500">Analytics</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm md:text-base leading-relaxed font-light normal-case">
              Centralized oversight of performance metrics, unconstrained demand trajectories, and neural guest intelligence models.
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-10">
            <Link 
              href="/admin/staffing" 
              className={`inline-flex items-center gap-3 px-10 py-4 text-[10px] font-medium uppercase tracking-[0.3em] transition-all border ${
                isDark ? "bg-white text-black border-white hover:bg-transparent hover:text-white" : "bg-black text-white border-black hover:bg-transparent hover:text-black"
              }`}
            >
              <Calendar className="w-4 h-4" /> Personnel Map
            </Link>
            
            <div className="flex gap-12 text-[10px] font-light tracking-[0.3em] uppercase opacity-60">
              <div className="flex flex-col gap-3">
                <span className="text-[8px] font-bold opacity-50">System Load</span>
                <span className="text-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Optimal
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[8px] font-bold opacity-50">Security Hash</span>
                <span className="flex items-center gap-2 normal-case font-mono">
                  <ShieldCheck className="w-3 h-3" /> AE-729
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-32 md:space-y-48">
        <div className="relative">
          <div className="absolute -left-12 top-0 h-full w-[1px] bg-neutral-100 dark:bg-white/5 hidden xl:block" />
          <OccupancyAnalytics />
        </div>

        <div className="relative">
          <div className="absolute -left-12 top-0 h-full w-[1px] bg-neutral-100 dark:border-white/5 hidden xl:block" />
          <PricingDemo />
        </div>

        <div className="relative">
          <div className="absolute -left-12 top-0 h-full w-[1px] bg-neutral-100 dark:bg-white/5 hidden xl:block" />
          <GuestIntelligence />
        </div>
      </div>
    </main>
  );
}
