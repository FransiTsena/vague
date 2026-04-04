"use client";

import PricingDemo from "@/components/sections/PricingDemo";
import OccupancyAnalytics from "@/components/sections/OccupancyAnalytics";
import GuestIntelligence from "@/components/sections/GuestIntelligence";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen theme-transition pb-32 bg-background text-foreground">
      <div className="pt-20 pb-16 px-4 md:px-8 border-b border-neutral-800/10 dark:border-neutral-800 bg-neutral-900 dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
              Revenue & Analytics
            </h1>
            <p className="text-neutral-400 dark:text-neutral-500 max-w-xl text-sm leading-relaxed font-light">
              System-level oversight of dynamic pricing models, forecasted occupancy trajectories, and real-time customer intelligence patterns.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            <Link 
              href="/admin/staffing" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
            >
              <Calendar className="w-3.5 h-3.5" /> View Deployment Map
            </Link>
            <div className="flex gap-8 text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-500">
              <div className="flex flex-col gap-2">
                <span>System Status</span>
                <span className="text-foreground flex items-center gap-2 font-bold">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Active
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span>Last Sync</span>
                <span className="text-foreground font-bold tracking-normal italic">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-24 pt-16">
        <OccupancyAnalytics />

        <PricingDemo />
        <GuestIntelligence />
      </div>
    </main>
  );
}
