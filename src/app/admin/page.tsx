"use client";

import Link from "next/link";
import { ArrowRight, QrCode, GalleryHorizontalEnd, LayoutDashboard } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const adminCards = [
  {
    href: "/admin/analytics",
    title: "AI Analytics",
    description: "Access guest intelligence, dynamic pricing, and occupancy forecasting.",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/gallery",
    title: "Gallery Admin",
    description: "Manage showcase projects, upload imagery, and edit display content.",
    icon: GalleryHorizontalEnd,
  },
  {
    href: "/admin/provenance",
    title: "Provenance Admin",
    description: "Create QR-linked products and generate scan-ready story pages.",
    icon: QrCode,
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

          <h1 className="font-serif text-4xl leading-tight md:text-6xl">Control center for hotel content and QR-driven provenance.</h1>
          <p className={`max-w-2xl text-sm leading-7 md:text-base ${isDark ? "text-neutral-300" : "text-neutral-600"
            }`}>
            Use this dashboard to manage the experience behind guest-facing pages, from gallery content to the new provenance routes that resolve from a QR scan.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group rounded-[2rem] border p-6 transition duration-300 ${isDark
                    ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 shadow-2xl"
                    : "border-black/10 bg-white hover:border-black/20 hover:bg-neutral-50 shadow-sm hover:shadow-md"
                  }`}
              >
                <Icon className={`h-6 w-6 ${isDark ? "text-neutral-300" : "text-neutral-600"}`} />
                <h2 className={`mt-5 font-serif text-3xl ${isDark ? "text-white" : "text-neutral-900"}`}>{card.title}</h2>
                <p className={`mt-3 max-w-lg text-sm leading-7 ${isDark ? "text-neutral-400" : "text-neutral-500"
                  }`}>{card.description}</p>
                <span className={`mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] transition group-hover:translate-x-1 ${isDark ? "text-white" : "text-neutral-900"
                  }`}>
                  Open
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
