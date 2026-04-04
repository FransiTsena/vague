"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  ShieldCheck,
  Building,
  Activity,
  BarChart3,
  Clock,
  ExternalLink
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsAdminPage() {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/analytics");
        const d = await res.json();
        setData(d);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${isDark ? "bg-[#050505]" : "bg-[#fcfcfc]"}`}>
      <Loader2 className={`w-10 h-10 animate-spin ${isDark ? "text-amber-500/20" : "text-amber-500/40"} mb-4`} />
      <span className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-20 ${isDark ? "text-white" : "text-black"}`}>Extracting Neural Insights...</span>
    </div>
  );

  return (
    <main className={`min-h-screen pt-24 pb-20 px-6 sm:px-12 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Navigation / Metadata */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                <ArrowLeft className="w-3 h-3" /> Executive Overview
            </Link>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Real-time Stream</span>
                </div>
            </div>
        </div>

        <section className="mb-20">
            <h1 className="font-serif text-6xl md:text-8xl italic tracking-tight lowercase mb-8">
                Business <span className="text-zinc-500">Foresight</span>
            </h1>
            <p className="max-w-2xl text-base md:text-lg text-neutral-400 font-medium leading-relaxed">
                High-fidelity projection models based on live property load, guest behavior patterns, and historical yield optimization.
            </p>
        </section>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Real-time Occupancy */}
            <div className={`p-10 rounded-[3rem] border transition-all duration-700 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-xl"}`}>
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Property Load</h3>
                    <Activity className="w-4 h-4 opacity-20" />
                </div>
                <div className="space-y-2 mb-10">
                    <p className="text-7xl font-serif italic">{data?.occupancy || 0}<span className="text-3xl text-zinc-500">%</span></p>
                    <p className="text-[11px] font-black uppercase tracking-widest opacity-40 italic">Current Check-in Ratio</p>
                </div>
                <div className={`h-1 w-full rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${data?.occupancy || 0}%` }} transition={{ duration: 1 }} className="h-full bg-amber-500" />
                </div>
            </div>

            {/* Projected Revenue */}
            <div className={`p-10 rounded-[3rem] border transition-all duration-700 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-xl"}`}>
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Yield Projection</h3>
                    <BarChart3 className="w-4 h-4 opacity-20" />
                </div>
                <div className="space-y-2">
                    <p className="text-6xl font-serif italic">$1.2M</p>
                    <p className="text-[11px] font-black uppercase tracking-widest opacity-40 italic">30-Day Anticipated Gross</p>
                </div>
            </div>

            {/* AI Logistics Alert */}
            <div className={`p-10 rounded-[3rem] border transition-all duration-700 ${isDark ? "bg-white/[0.03] border-amber-500/20" : "bg-white border-amber-500/20 shadow-xl"}`}>
                <div className="flex items-center gap-3 mb-10 text-amber-500">
                    <Brain className="w-5 h-5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Alert</h3>
                </div>
                <p className="text-lg font-medium leading-relaxed italic mb-8">
                    "{data?.aiNote || "Property operating within normal parameters. No immediate staffing adjustments required for current load."}"
                </p>
                <Link href="/admin/staffing" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:gap-4 transition-all">
                    Adjust Workforce <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

        </div>

        {/* Detailed Metrics Table */}
        <div className="mt-20">
            <div className={`p-1 rounded-[3.5rem] border transition-all duration-700 ${isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-black/5 shadow-2xl"}`}>
                <div className="p-12 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b ${isDark ? "border-white/10" : "border-black/10"}`}>
                                <th className="pb-6 text-[9px] font-black uppercase tracking-widest opacity-40">Segment</th>
                                <th className="pb-6 text-[9px] font-black uppercase tracking-widest opacity-40">Growth</th>
                                <th className="pb-6 text-[9px] font-black uppercase tracking-widest opacity-40">Status</th>
                                <th className="pb-6 text-right text-[9px] font-black uppercase tracking-widest opacity-40">Details</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-black/5"}`}>
                            {[
                                { name: "Room Service Yield", growth: "+12%", status: "Optimized", trendUp: true },
                                { name: "Direct Booking Ratio", growth: "+24%", status: "Expanding", trendUp: true },
                                { name: "Spa Enrollment", growth: "-4%", status: "Underperforming", trendUp: false },
                                { name: "Guest Retention", growth: "+8%", status: "Stable", trendUp: true },
                            ].map((row, i) => (
                                <tr key={i} className={`group transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-black/[0.02]"}`}>
                                    <td className="py-8 pr-12">
                                        <p className="text-xl font-serif italic">{row.name}</p>
                                    </td>
                                    <td className="py-8">
                                        <div className="flex items-center gap-2">
                                            {row.trendUp ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                                            <span className="text-[11px] font-black uppercase tracking-widest">{row.growth}</span>
                                        </div>
                                    </td>
                                    <td className="py-8 pr-12">
                                        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 w-fit border ${isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${row.trendUp ? "bg-emerald-500" : "bg-amber-500"}`} />
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{row.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-8 text-right">
                                        <button className={`p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

      </div>
    </main>
  );
}
