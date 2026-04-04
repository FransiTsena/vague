"use client";

import PricingDemo from "@/components/sections/PricingDemo";
import OccupancyAnalytics from "@/components/sections/OccupancyAnalytics";
import GuestIntelligence from "@/components/sections/GuestIntelligence";
import { useTheme } from "@/context/ThemeContext";

export default function AnalyticsPage() {
  const { isDark } = useTheme();

  return (
    <main className={`min-h-screen theme-transition pb-32 ${
      isDark ? "bg-[#0a0a0a] text-neutral-200" : "bg-neutral-50 text-neutral-900"
    }`}>
      <div className={`pt-32 pb-16 px-4 md:px-8 border-b border-neutral-200 dark:border-neutral-800 ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 dark:text-white tracking-wide">
              Revenue & Analytics
            </h1>
            <p className="text-neutral-500 max-w-xl text-sm leading-relaxed">
              System-level oversight of dynamic pricing models, forecasted occupancy trajectories, and real-time customer intelligence patterns.
            </p>
          </div>
          <div className="flex gap-8 text-[10px] font-mono tracking-widest uppercase text-neutral-400">
            <div className="flex flex-col gap-2">
              <span>System Status</span>
              <span className="text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white inline-block"></span> Active
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span>Last Sync</span>
              <span className="text-neutral-900 dark:text-white">Just now</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-24 pt-16">
        <PricingDemo />
        <OccupancyAnalytics />
        <GuestIntelligence />
      </div>
    </main>
  );
}
