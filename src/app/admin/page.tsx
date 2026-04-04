"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  ArrowRight, 
  QrCode, 
  GalleryHorizontalEnd, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  TrendingUp, 
  Bell, 
  PlusCircle,
  AlertTriangle,
  Brain,
  Zap,
  Hotel
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

interface OverviewData {
  overview: {
    occupancy: number;
    bookedRooms: number;
    totalRooms: number;
    activeStaff: number;
    totalStaff: number;
  };
  projections: Array<{ day: string; rate: number }>;
  alerts: Array<{ type: string; message: string; action: string }>;
}

const quickActions = [
  { label: "Create Schedule", icon: PlusCircle, href: "/admin/scheduling" },
  { label: "Update Gallery", icon: GalleryHorizontalEnd, href: "/admin/gallery" },
  { label: "Dynamic Pricing", icon: TrendingUp, href: "/admin/analytics" },
  { label: "Guest Insights", icon: Users, href: "/admin/analytics" },
];

const adminCards = [
  {
    href: "/admin/analytics",
    title: "AI Analytics",
    description: "Access guest intelligence, dynamic pricing, and occupancy forecasting.",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/scheduling",
    title: "Scheduling Admin",
    description: "Manage hotel-wide operations, staff rosters, and department schedules.",
    icon: Calendar,
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
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className={`min-h-screen theme-transition pb-20 ${isDark
        ? "bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.18),_transparent_34%),linear-gradient(180deg,_#050505_0%,_#090909_100%)] text-white"
        : "bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.1),_transparent_45%),linear-gradient(180deg,_#f8f8f8_0%,_#ffffff_100%)] text-neutral-900"
      }`}>
      
      {/* Dynamic Alerts Bar */}
      {data?.alerts?.length ? (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6">
          {data.alerts.map((alert, i) => (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className="flex items-center justify-between p-4 mb-2 bg-red-500 text-white rounded-2xl shadow-xl backdrop-blur-lg border border-red-400/30"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">{alert.message}</span>
              </div>
              <Link href={alert.action} className="text-[10px] font-bold underline uppercase tracking-widest">
                Address Now
              </Link>
            </motion.div>
          ))}
        </div>
      ) : null}

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pt-28 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Property Live
                </div>
            </div>
            
            <h1 className="font-serif text-4xl leading-tight md:text-6xl italic">Executive Overview</h1>
            <p className={`max-w-2xl text-sm leading-7 md:text-base ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
              Welcome back, General Manager. Your property is executing with AI-driven efficiency. Current focus: **Staffing vs Occupancy Ratios**.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all border ${isDark
                    ? "bg-white text-black border-white hover:bg-neutral-200"
                    : "bg-black text-white border-black hover:bg-neutral-800"
                    }`}
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className={`flex-1 rounded-[2.5rem] p-10 border transition-all duration-500 relative overflow-hidden group ${isDark
            ? "border-white/10 bg-white/5 shadow-2xl"
            : "border-black/5 bg-white shadow-sm"
            }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-neural-500 mb-2 flex items-center gap-2">
                    <Brain className="w-3 h-3 text-amber-500" />
                    AI Occupancy Projection
                </h3>
                <p className="font-serif text-3xl italic">Upcoming Property Pulse</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"}`}>
                WEEKLY FORECAST
              </div>
            </div>

            <div className="flex items-end justify-between h-48 gap-3">
              {(data?.projections || []).map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full flex flex-col justify-end h-32 group">
                    <div 
                      className={`w-full rounded-2xl transition-all duration-1000 ease-out group-hover:opacity-80 scale-x-90 origin-bottom ${isDark ? "bg-white/80" : "bg-black"}`}
                      style={{ height: `${item.rate}%` }}
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all font-mono translate-y-2 group-hover:translate-y-0">
                      {item.rate}%
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Intel Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className={`p-8 rounded-[2.5rem] border overflow-hidden relative group transition-all duration-500 ${isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50/50 border-emerald-500/10 shadow-sm"}`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-2xl -mr-8 -mt-8" />
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Output Efficiency
                </h5>
                <p className="text-5xl font-serif italic mb-2">{data?.overview.occupancy || 0}%</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Global Occupancy Status</p>
            </div>

            <div className={`p-8 rounded-[2.5rem] border overflow-hidden relative group transition-all duration-500 ${isDark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50/50 border-amber-500/10 shadow-sm"}`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-2xl -mr-8 -mt-8" />
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Active Logistics
                </h5>
                <p className="text-5xl font-serif italic mb-2">{data?.overview.activeStaff || 0}</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Staff Members On-Shift</p>
            </div>

            <div className={`p-8 rounded-[2.5rem] border overflow-hidden relative group transition-all duration-500 ${isDark ? "bg-zinc-500/5 border-zinc-500/20" : "bg-zinc-50/50 border-zinc-500/10 shadow-sm"}`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-500/10 blur-2xl -mr-8 -mt-8" />
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                    <Hotel className="w-3 h-3" /> Inventory Pulse
                </h5>
                <p className="text-5xl font-serif italic mb-2">{data?.overview.bookedRooms || 0}</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Active Bookings Today</p>
            </div>
        </div>

        <div className="mt-12">
          <div className="flex items-baseline justify-between mb-10 border-b border-neutral-100 dark:border-white/10 pb-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-500 italic">Property Management Nodes</h4>
            <span className="text-[9px] font-mono text-zinc-400">SESSION: 2026.04.04</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {adminCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className={`group rounded-[2.5rem] border p-10 transition-all duration-500 flex flex-col items-start ${isDark
                      ? "border-white/10 bg-white/5 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl"
                      : "border-black/5 bg-white hover:border-black/10 hover:shadow-lg shadow-sm"
                    }`}
                >
                  <div className={`p-4 rounded-3xl mb-8 transition-all duration-500 group-hover:scale-110 ${isDark ? "bg-white/8 outline outline-1 outline-white/10" : "bg-black/5 shadow-inner"}`}>
                    <Icon className={`h-6 w-6 ${isDark ? "text-white" : "text-black"}`} />
                  </div>
                  <h2 className={`font-serif text-3xl italic leading-none mb-4 ${isDark ? "text-white" : "text-neutral-900"}`}>{card.title}</h2>
                  <p className={`text-[10px] leading-relaxed uppercase tracking-widest opacity-60 font-medium ${isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}>{card.description}</p>
                  
                  <div className="mt-10 flex items-center gap-3 group/btn">
                    <span className={`text-[10px] uppercase tracking-[0.4em] font-black transition-all border-b-2 pb-1 ${isDark ? "text-white border-white/20" : "text-black border-black/10"}`}>
                      ENTER MODULE
                    </span>
                    <ArrowRight className={`h-4 w-4 transition-transform group-hover/btn:translate-x-2 ${isDark ? "text-white" : "text-black"}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}"
