"use client";

import OccupancyAnalytics from "@/components/sections/OccupancyAnalytics";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";

export default function OccupancyPage() {
  const { isDark } = useTheme();
  return (
    <main className={`min-h-screen pb-20 pt-8 md:pt-12 px-6 sm:px-12 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="max-w-7xl mx-auto">
        <Link href="/admin/analytics" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 mb-8 transition-opacity">
          <ArrowLeft className="w-3 h-3" /> Analytics Overview
        </Link>
        
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight mb-4 lowercase first-letter:uppercase">
            Occupancy <span className="italic text-neutral-400 dark:text-neutral-500">Forecasting</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-xs md:text-sm leading-relaxed font-light">
            Deep-dive occupancy metrics, unconstrained demand trajectories, and property utilization models.
          </p>
        </div>

        <OccupancyAnalytics />
      </div>
    </main>
  );
}
