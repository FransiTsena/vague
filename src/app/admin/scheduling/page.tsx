"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  ShieldCheck,
  Building,
  Activity,
  BarChart3,
  Clock,
  ExternalLink,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SchedulingAdminPage() {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/admin/staffing/events");
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/";
          return;
        }
        const data = await res.json();
        setEvents(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (isLoading) return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${isDark ? "bg-[#050505]" : "bg-[#fcfcfc]"}`}>
      <Loader2 className={`w-10 h-10 animate-spin mb-4 ${isDark ? "text-amber-500/20" : "text-amber-500/40"}`} />
      <span className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-20 ${isDark ? "text-white" : "text-black"}`}>Orchestrating Time Streams...</span>
    </div>
  );

  return (
    <main className={`min-h-screen pt-6 pb-20 px-6 sm:px-12 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Navigation / Metadata */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                <ArrowLeft className="w-3 h-3" /> Executive Overview
            </Link>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Timeline Synced</span>
                </div>
            </div>
        </div>

        <section className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-end">
            <div>
                <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-8">
                    Logistics <span className="text-zinc-500">& Flow</span>
                </h1>
                <p className="max-w-xl text-base md:text-lg text-neutral-400 font-medium leading-relaxed">
                    "Managing the pulse of the property. Every shift, every task, synchronized with guest expectations and high-performance standards."
                </p>
            </div>
            
            <div className="flex flex-col gap-6 lg:items-end">
                <div className="flex items-center gap-4">
                    <Link href="/admin/staffing" className={`px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 ${isDark ? "bg-white/5 border border-white/10 hover:bg-white/10 shadow-2xl shadow-white/5" : "bg-black text-white hover:bg-neutral-800"}`}>
                        <Calendar className="w-4 h-4 text-amber-500" /> View Deployment Map
                    </Link>
                    <button className={`p-5 rounded-full border ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-white shadow-xl hover:bg-neutral-50"}`}>
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>

        {/* Rapid Shift Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
                { label: "Active Shifts", value: events.length, icon: Users, trend: "+4%", trendUp: true },
                { label: "Pending Tasks", value: "42", icon: Zap, trend: "-12%", trendUp: false },
                { label: "Avg Response", value: "14m", icon: Clock, trend: "Steady", trendUp: true },
            ].map((stat, i) => (
                <div key={i} className={`p-10 rounded-none border-none transition-all duration-300 hover:-translate-y-1 ${isDark ? "bg-[#0a0a0a] shadow-[0_0_20px_rgba(255,255,255,0.07)] hover:shadow-[0_0_35px_rgba(255,255,255,0.12)]" : "bg-black shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"}`}>
                    <div className="flex items-center justify-between mb-8">
                        <stat.icon className="w-5 h-5 text-white/50" />
                        <div className="flex items-center gap-1.5 rounded-none px-3 py-1 bg-white/10 text-white shadow-sm border border-white/5">
                            {stat.trendUp ? <ArrowUpRight className="w-3 h-3 text-white" /> : <ArrowDownRight className="w-3 h-3 text-white" />}
                            <span className="text-[9px] font-bold tracking-widest">{stat.trend}</span>
                        </div>
                    </div>
                    <p className="text-5xl font-serif mb-2 text-white">{stat.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-white">{stat.label}</p>
                </div>
            ))}
        </div>

        {/* Log Stream */}
        <div className={`rounded-xl border shadow-[0_4px_24px_rgba(0,0,0,0.1)] overflow-hidden ${isDark ? "border-white/10 bg-[#0a0a0a] shadow-white/5" : "border-black/5 bg-white shadow-black/5"}`}>
            <div className={`p-8 border-b flex justify-between items-center ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <h3 className="text-xs font-bold uppercase tracking-widest">Recent Operations Stream</h3>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                        <input className={`pl-9 pr-4 py-2 rounded-lg text-xs font-medium border outline-none transition-all ${isDark ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-black/5 border-black/10 focus:border-black/20"}`} placeholder="Search logs..." />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className={isDark ? "bg-white/5 text-white" : "bg-neutral-900 text-white"}>
                        <tr>
                            <th className="py-4 px-6 text-xs font-semibold tracking-wide">Shift Operator</th>
                            <th className="py-4 px-6 text-xs font-semibold tracking-wide">Deployment Area</th>
                            <th className="py-4 px-6 text-xs font-semibold tracking-wide">Status</th>
                            <th className="py-4 px-6 text-right text-xs font-semibold tracking-wide">Timeline</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-white/10" : "divide-neutral-200"}`}>
                        {Array.isArray(events) && events.slice(0, 10).map((evt, i) => (
                            <tr key={i} className={`group cursor-pointer transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-neutral-50"}`}>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isDark ? "bg-white/10 text-white" : "bg-black/10 text-black"}`}>{(evt.title || "?").charAt(0)}</div>
                                        <p className="text-sm font-medium">{(evt.title || "No Title").split(' - ')[1] || evt.title}</p>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm opacity-80">
                                    {(evt.title || "").split(' - ')[0] || "General Area"}
                                </td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md px-2.5 py-1 text-xs font-semibold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Active
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right font-mono text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                                    {evt.startsAt ? new Date(evt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </main>
  );
}
