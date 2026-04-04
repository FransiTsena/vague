"use client";

import Link from "next/link";
import { ArrowRight, QrCode, GalleryHorizontalEnd, LayoutDashboard, Calendar, Users, Briefcase } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const adminCards = [
  {
    href: "/admin/analytics",
    title: "AI Analytics",
    description: "Access guest intelligence, dynamic pricing, and occupancy forecasting.",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/scheduling",
    title: "Staff Management",
    description: "Orchestrate workforce, manage shifts, and analyze staffing efficiency.",
    icon: Users,
  },
  {
    href: "/admin/provenance",
    title: "Provenance Admin",
    description: "Create QR-linked products and generate scan-ready story pages.",
    icon: QrCode,
  },
  {
    href: "/admin/gallery",
    title: "Gallery Admin",
    description: "Manage showcase projects, upload imagery, and edit display content.",
    icon: GalleryHorizontalEnd,
  },
];

export default function AdminHomePage() {
  const { isDark } = useTheme();

  return (
    <main className={`min-h-screen theme-transition ${isDark
        ? "bg-[#0c0c0c] text-white"
        : "bg-neutral-50 text-neutral-900"      
      }`}>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-28 md:px-12">
        <div className="max-w-3xl space-y-5">
          <h1 className="font-serif text-4xl leading-tight md:text-6xl text-neutral-900 dark:text-white">Unified HMS Control Center.</h1>
          <p className={`max-w-2xl text-sm leading-7 md:text-base ${isDark ? "text-neutral-300" : "text-neutral-600"
            }`}>
            A comprehensive executive interface for managing property content, AI-driven analytics, and internal staff operations.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group rounded-none border-none p-10 transition-all duration-300 hover:-translate-y-1 ${isDark
                    ? "bg-[#0a0a0a] shadow-[0_0_20px_rgba(255,255,255,0.07)] hover:shadow-[0_0_35px_rgba(255,255,255,0.12)]"
                    : "bg-black shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                  }`}
              >
                <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-white/80" />
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 transition-transform text-white" />
                </div>
                <h2 className="mt-8 font-serif text-3xl text-white">{card.title}</h2>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/80">{card.description}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] transition text-white/60">
                  Management Suite
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
