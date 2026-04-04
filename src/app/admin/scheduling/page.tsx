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
                <h1 className="font-serif text-6xl md:text-8xl italic tracking-tight lowercase mb-8">
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
                { label: "Active Shifts", value: events.length, icon: Users, trend: "+4%", trendUp: true, color: "text-blue-500" },
                { label: "Pending Tasks", value: "42", icon: Zap, trend: "-12%", trendUp: false, color: "text-amber-500" },
                { label: "Avg Response", value: "14m", icon: Clock, trend: "Steady", trendUp: true, color: "text-emerald-500" },
            ].map((stat, i) => (
                <div key={i} className={`p-10 rounded-[3rem] border transition-all duration-700 ${isDark ? "bg-white/5 border-white/10 shadow-2xl" : "bg-white border-black/5 shadow-xl"}`}>
                    <div className="flex items-center justify-between mb-8">
                        <stat.icon className={`w-5 h-5 opacity-40 ${isDark ? "text-white" : "text-black"}`} />
                        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                            {stat.trendUp ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
                            <span className="text-[9px] font-black tracking-widest">{stat.trend}</span>
                        </div>
                    </div>
                    <p className="text-5xl font-serif italic mb-2">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20">{stat.label}</p>
                </div>
            ))}
        </div>

        {/* Log Stream */}
        <div className={`p-1 rounded-[3.5rem] border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-white shadow-2xl"}`}>
            <div className="p-12 overflow-x-auto">
                <div className="flex items-center justify-between mb-12">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Recent Operations Stream</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-20" />
                            <input className={`pl-10 pr-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest outline-none transition-all ${isDark ? "bg-white/5 border-white/5 focus:border-white/20" : "bg-black/5 border-black/5 focus:border-black/20"}`} placeholder="Query Database..." />
                        </div>
                        <button className={`p-3 rounded-full border opacity-40 hover:opacity-100 transition-opacity ${isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"}`}>
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr className={`border-b ${isDark ? "border-white/10" : "border-black/10"}`}>
                            <th className="pb-6 text-[9px] font-black uppercase tracking-widest opacity-40">Shift Operator</th>
                            <th className="pb-6 text-[10px] font-black uppercase tracking-widest opacity-40">Deployment Area</th>
                            <th className="pb-6 text-[9px] font-black uppercase tracking-widest opacity-40">Status Cache</th>
                            <th className="pb-6 text-right text-[9px] font-black uppercase tracking-widest opacity-40">Timeline</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-black/5"}`}>
                        {Array.isArray(events) && events.slice(0, 10).map((evt, i) => (
                            <tr key={i} className={`group transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-black/[0.02]"}`}>
                                <td className="py-8 pr-12">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif italic text-lg ${isDark ? "bg-white/5" : "bg-black/5"}`}>{evt.title.charAt(0)}</div>
                                        <p className="text-xl font-serif italic">{evt.title.split(' - ')[1] || evt.title}</p>
                                    </div>
                                </td>
                                <td className="py-8 pr-12">
                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-60">{evt.title.split(' - ')[0] || "General Area"}</span>
                                </td>
                                <td className="py-8">
                                    <div className="flex items-center gap-2 bg-emerald-500/5 text-emerald-500 rounded-full px-4 py-1.5 w-fit border border-emerald-500/10">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Active Deployment</span>
                                    </div>
                                </td>
                                <td className="py-8 text-right font-mono text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                                    {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
