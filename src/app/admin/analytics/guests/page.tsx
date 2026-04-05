"use client";

import GuestIntelligence from "@/components/sections/GuestIntelligence";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default function GuestIntelligencePage() {
  const { isDark } = useTheme();
  return (
    <main className={`min-h-screen pb-20 pt-8 md:pt-12 px-6 sm:px-12 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="max-w-7xl mx-auto">
        <Link href="/admin/analytics" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 mb-8 transition-opacity">
          <ArrowLeft className="w-3 h-3" /> Analytics Overview
        </Link>
        
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight mb-4 lowercase first-letter:uppercase">
            Guest <span className="italic text-neutral-400 dark:text-neutral-500">Intelligence</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-xs md:text-sm leading-relaxed font-light">
            Neural predictive models for guest preferences, stay duration forecasting, and behavioral aesthetics.
          </p>
        </div>

        <GuestIntelligence />
      </div>
    </main>
  );
}
