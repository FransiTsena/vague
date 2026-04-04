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
    <main className={`min-h-screen theme-transition pb-20 ${isDark ? "bg-black text-white" : "bg-white text-black"} pt-8 md:pt-12 tracking-widest`}>
      {/* Header Section */}
      <div className="mx-6 px-6 sm:px-12 mb-12 md:mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-100 dark:border-white/10 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-50">
              <Activity className="w-3 h-3" />
              <span className="text-[9px] font-bold tracking-[0.4em]">Intelligence Suite</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight lowercase first-letter:uppercase">
              Revenue & <span className="italic text-neutral-400 dark:text-neutral-500">Analytics</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-xs md:text-sm leading-relaxed font-light normal-case">
              Centralized oversight of performance metrics, unconstrained demand trajectories, and neural guest intelligence models.
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-10">
            <Link 
              href="/admin/staffing" 
              className={`inline-flex items-center gap-3 px-8 py-3 text-[9px] font-medium uppercase tracking-[0.3em] transition-all border ${
                isDark ? "bg-white text-black border-white hover:bg-transparent hover:text-white" : "bg-black text-white border-black hover:bg-transparent hover:text-black"
              }`}
            >
              <Calendar className="w-4 h-4" /> Personnel Map
            </Link>
            
            <div className="flex gap-12 text-[9px] font-light tracking-[0.3em] uppercase opacity-60">
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
      <div className="mx-6 px-6 sm:px-12 space-y-8 md:space-y-12">
        <div className="relative">
          <div className="absolute -left-12 top-0 h-full w-[1px] bg-neutral-100 dark:bg-white/5 hidden xl:block" />
          <OccupancyAnalytics />
        </div>

        <div className="relative border-t border-neutral-100 dark:border-white/5 pt-8 md:pt-12">
          <div className="absolute -left-12 top-0 h-full w-[1px] bg-neutral-100 dark:bg-white/5 hidden xl:block" />
          <PricingDemo />
        </div>

        <div className="relative border-t border-neutral-100 dark:border-white/5 pt-8 md:pt-12">
          <div className="absolute -left-12 top-0 h-full w-[1px] bg-neutral-100 dark:bg-white/5 hidden xl:block" />
          <GuestIntelligence />
        </div>
      </div>
    </main>
  );
}
