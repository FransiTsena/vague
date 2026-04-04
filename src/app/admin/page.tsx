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
        ? "bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.18),_transparent_34%),linear-gradient(180deg,_#050505_0%,_#090909_100%)] text-white"
        : "bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.1),_transparent_45%),linear-gradient(180deg,_#f8f8f8_0%,_#ffffff_100%)] text-neutral-900"      
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
                className={`group rounded-[2rem] border p-10 transition duration-300 ${isDark
                    ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 shadow-2xl"
                    : "border-black/10 bg-white hover:border-black/20 hover:bg-neutral-50 shadow-sm hover:shadow-md"
                  }`}
              >
                <div className="flex items-center justify-between">
                    <Icon className={`h-8 w-8 ${isDark ? "text-amber-500/80" : "text-neutral-600"}`} />
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 transition-transform" />
                </div>
                <h2 className={`mt-8 font-serif text-3xl ${isDark ? "text-white" : "text-neutral-900"}`}>{card.title}</h2>
                <p className={`mt-3 max-w-lg text-sm leading-7 ${isDark ? "text-neutral-400" : "text-neutral-500"
                  }`}>{card.description}</p>
                <span className={`mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] transition ${isDark ? "text-amber-500/60" : "text-neutral-900"
                  }`}>
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
