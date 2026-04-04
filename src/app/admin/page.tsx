"use client";

import Link from "next/link";
import { ArrowUpRight, QrCode, GalleryHorizontalEnd, LayoutDashboard, Users, Activity, ShieldCheck, Grid3X3 } from "lucide-react";
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
    <main className={`min-h-screen theme-transition ${isDark ? "bg-black text-white" : "bg-white text-neutral-900"} pt-6 md:pt-6`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-4 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-neutral-100 dark:border-white/10 pb-10 mb-12 md:mb-16">
          <div className="max-w-4xl space-y-4">
          
            <h1 className="font-serif text-4xl leading-[1.1] md:text-7xl font-light tracking-tight">
              Unified <span className="italic text-neutral-400 dark:text-neutral-500">Property</span> Management
            </h1>
            <p className="max-w-xl text-sm leading-relaxed font-light text-neutral-500 dark:text-neutral-400">
              Centralized high-fidelity interface for property oversight, architectural curation, and operational excellence.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 opacity-40 font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span className="text-[8px] font-bold tracking-[0.3em]">SYSTEM ACTIVE</span>
            </div>
            
          </div>
        </div>

        {/* Admin Navigation Grid - Tighter Density */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-100 dark:bg-white/10 border border-neutral-100 dark:border-white/10">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative flex flex-col p-8 md:p-10 transition-all duration-700 ${
                  isDark ? "bg-black hover:bg-neutral-900/50" : "bg-white hover:bg-neutral-50"
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
