"use client";

import PricingDemo from "@/components/sections/PricingDemo";
import OccupancyAnalytics from "@/components/sections/OccupancyAnalytics";
import GuestIntelligence from "@/components/sections/GuestIntelligence";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  return (
    <main className="min-h-screen theme-transition pb-32 bg-background text-foreground pt-12">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 mb-16">
        <div className="p-12 transition-all duration-300 bg-white dark:bg-[#0a0a0a] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_0_20px_rgba(255,255,255,0.04)] border-none rounded-none">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
                Revenue & Analytics
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm leading-relaxed font-light">
                System-level oversight of dynamic pricing models, forecasted occupancy trajectories, and real-time customer intelligence patterns.
              </p>
            </div>
          <div className="flex flex-col md:items-end gap-6">
            <Link 
              href="/admin/staffing" 
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-md ${
                isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              <Calendar className="w-4 h-4" /> View Deployment Map
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
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 space-y-24">
        <OccupancyAnalytics />

        <PricingDemo />
        <GuestIntelligence />
      </div>
    </main>
  );
}
