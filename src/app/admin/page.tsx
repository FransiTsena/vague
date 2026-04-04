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
  Hotel,
  ChevronRight,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Command
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

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

const adminCards = [
  {
    href: "/admin/analytics",
    title: "Intelligence",
    subtitle: "Predictive Analytics",
    description: "Occupancy forecasting and guest behavior modeling powered by neural engines.",
    icon: Brain,
    stats: "98.2% Accuracy"
  },
  {
    href: "/admin/scheduling",
    title: "Operations",
    subtitle: "Logistics & Flow",
    description: "Real-time staff orchestration and cross-departmental synchronization.",
    icon: Calendar,
    stats: "24 Active Shifts"
  },
  {
    href: "/admin/gallery",
    title: "Aesthetics",
    subtitle: "Visual Curations",
    description: "Architectural showcases and digital assets for the property's public identity.",
    icon: GalleryHorizontalEnd,
    stats: "4k+ High Res"
  },
  {
    href: "/admin/provenance",
    title: "Provenance",
    subtitle: "Digital Heritage",
    description: "Identity management for high-value assets and QR-linked guest experiences.",
    icon: ShieldCheck,
    stats: "1.2k Assets"
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <main className={`min-h-screen theme-transition pb-32 pt-12 px-6 sm:px-12 lg:px-20 ${isDark
        ? "bg-[#050505] text-white"
        : "bg-[#fcfcfc] text-neutral-900"
      }`}>
      
      {/* Background Subtle Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDark ? "bg-amber-500/10" : "bg-amber-500/5"}`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDark ? "bg-blue-500/10" : "bg-blue-500/5"}`} />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Header Section */}
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-[1px] ${isDark ? "bg-amber-500/40" : "bg-black/20"}`} />
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? "text-amber-500/60" : "text-neutral-500"}`}>Executive Command</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight lowercase leading-[0.9]">
              Strategic <span className="opacity-40">Overview</span>
            </h1>
            <p className={`mt-8 text-lg font-medium max-w-xl leading-relaxed opacity-60 ${isDark ? "font-light" : ""}`}>
              Synthesizing property intelligence and operational flow into a single, cohesive interface for high-performance management.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center gap-8"
          >
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">System Status</p>
              <div className="flex items-center justify-end gap-2 text-emerald-500">
                <span className="text-[10px] font-mono tracking-tighter uppercase font-bold">All Subsystems Nominal</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </header>

        {/* Rapid Stats Bar */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-32"
        >
          {[
            { label: "Real-time Occupancy", value: data?.overview?.occupancy ? `${data.overview.occupancy}%` : "84%", trend: "+2.4%", icon: Activity },
            { label: "Revenue Delta", value: "$142k", trend: "+12%", trendUp: true, icon: TrendingUp },
            { label: "Staff Efficiency", value: "94/100", trend: "+0.8%", icon: Users },
            { label: "System Uptime", value: "99.98%", trend: "Stable", icon: ShieldCheck },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              className={`p-8 rounded-3xl border transition-all duration-500 group ${isDark ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10" : "bg-white border-black/5 hover:shadow-2xl"}`}
            >
              <div className="flex items-center justify-between mb-8">
                <stat.icon className={`w-4 h-4 opacity-30 ${isDark ? "text-white" : "text-black"}`} />
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${isDark ? "bg-white/5" : "bg-black/5"} ${stat.trend.includes("+") ? "text-emerald-500" : "text-amber-500"}`}>
                  {stat.trend}
                </div>
              </div>
              <p className="text-4xl font-serif italic mb-1">{stat.value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Main Grid Actions */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {adminCards.map((card, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
            >
              <Link href={card.href} className="group block h-full">
                <div className={`relative h-full p-10 md:p-14 rounded-[3rem] border overflow-hidden transition-all duration-700 ${isDark ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/20" : "bg-white border-black/5 shadow-xl hover:shadow-2xl"}`}>
                  
                  {/* Card Background Branding */}
                  <div className={`absolute top-[-10%] right-[-5%] w-64 h-64 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000 ${isDark ? "invert" : ""}`}>
                     <card.icon className="w-full h-full" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-16">
                      <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-amber-500" : "bg-black/5 text-black"}`}>
                        <card.icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">{card.stats}</span>
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${isDark ? "border-white/10 group-hover:bg-white group-hover:text-black" : "border-black/5 group-hover:bg-black group-hover:text-white"}`}>
                            <ArrowUpRight className="w-4 h-4" />
                         </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-3 ${isDark ? "text-amber-500/60" : "text-neutral-500"}`}>
                        {card.subtitle}
                      </p>
                      <h3 className="text-4xl md:text-5xl font-serif italic mb-6 tracking-tight group-hover:translate-x-2 transition-transform duration-700">
                        {card.title}
                      </h3>
                      <p className="text-base md:text-lg opacity-40 group-hover:opacity-100 transition-opacity duration-700 font-medium leading-relaxed max-w-sm">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Aesthetic Corner Detail */}
                  <div className={`absolute bottom-0 right-0 p-8 opacity-0 group-hover:opacity-20 transition-opacity duration-700`}>
                    <Command className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.section>

        {/* System Logs Footer */}
        <footer className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-20 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol 12.0.4.5 Active</span>
                 </div>
                 <div className="w-[1px] h-4 bg-white/10" />
                 <span className="text-[9px] font-mono italic">"Elegance is the ultimate sophistication."</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest flex items-center gap-4">
                <span className="hover:text-amber-500 cursor-pointer transition-colors">Documentation</span>
                <span className="hover:text-amber-500 cursor-pointer transition-colors">Audit trail</span>
                <span className="hover:text-amber-500 cursor-pointer transition-colors">Vortex Node-01</span>
            </div>
        </footer>

      </div>
    </main>
  );
}
