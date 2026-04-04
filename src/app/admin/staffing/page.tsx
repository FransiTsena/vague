"use client";

import { useEffect, useState } from "react";
import { StaffingCalendar, CalendarItem } from "@/components/StaffingCalendar";
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
  Building
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const RiskBadge = ({ level }: { level: string }) => {
  const isHigh = level.toLowerCase() === "high";
  const isMed = level.toLowerCase() === "medium";
  return (
    <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 ${isHigh ? "border-rose-500/20 text-rose-500" : isMed ? "border-amber-500/20 text-amber-500" : "border-emerald-500/20 text-emerald-500"}`}>
      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isHigh ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-emerald-500"}`} />
      {level} DEPLOYMENT RISK
    </div>
  );
};

export default function StaffingAdminPage() {
  const { isDark } = useTheme();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");

  const handleAiForecast = async () => {
    if (!selectedDept) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/staffing/ai-predict", {
        method: "POST",
        body: JSON.stringify({ departmentId: selectedDept, date: new Date().toISOString() })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const [eRes, dRes] = await Promise.all([
          fetch("/api/admin/staffing/events"),
          fetch("/api/admin/staffing/departments")
        ]);
        const [evts, depts] = await Promise.all([eRes.json(), dRes.json()]);
        setItems(evts || []);
        setDepartments(depts || []);
        if (depts?.length) setSelectedDept(depts[0]._id);
      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505]">
      <Loader2 className="w-10 h-10 animate-spin text-amber-500/20 mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Synchronizing Logistics...</span>
    </div>
  );

  return (
    <main className={`min-h-screen pt-24 pb-20 px-6 sm:px-12 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Navigation / Metadata */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                <ArrowLeft className="w-3 h-3" /> Personnel Overview
            </Link>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Mongo DB Live</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Neural Cluster Active</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
            
            {/* Calendar / Schedule Perspective */}
            <div className="space-y-12">
                <section>
                    <h1 className="font-serif text-5xl md:text-7xl italic tracking-tight lowercase mb-6">
                        Neural <span className="text-zinc-500">Rosters</span>
                    </h1>
                    <p className="max-w-xl text-sm md:text-base text-neutral-400 font-medium leading-relaxed">
                        Execute workforce orchestration by reconciling real-time occupancy data with department availability.
                    </p>
                </section>

                <div className={`p-1 rounded-[2.5rem] border ${isDark ? "border-white/10" : "border-black/5"}`}>
                    <StaffingCalendar items={items} />
                </div>
            </div>

            {/* AI Control Center */}
            <div className="xl:sticky xl:top-28 space-y-8">
                <div className={`rounded-[3rem] p-10 border overflow-hidden relative transition-all duration-700 ${isDark ? "bg-white/5 border-white/10 shadow-2xl" : "bg-white border-black/5 shadow-xl"}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl -mr-32 -mt-32" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-10 flex items-center gap-3 italic">
                        <Brain className="w-4 h-4" /> Personnel Predictor
                    </h2>

                    <div className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[9px] uppercase font-black tracking-[0.2em] opacity-40 block">Select Target Department</label>
                            <div className="relative group">
                                <select 
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className={`w-full px-8 py-5 rounded-[1.5rem] border bg-transparent text-sm font-bold uppercase tracking-widest transition-all outline-none appearance-none hover:bg-white/[0.03] ${isDark ? "border-white/10" : "border-black/10"}`}
                                >
                                    {departments.map(d => <option className="bg-neutral-900" key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        </div>

                        <button 
                            onClick={handleAiForecast}
                            disabled={aiLoading}
                            className={`w-full py-6 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4  disabled:opacity-50 ${isDark ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-black text-white hover:bg-neutral-800"}`}
                        >
                            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Execute Logic Engine
                        </button>
                    </div>

                    <AnimatePresence>
                        {aiResult && (
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="mt-12 space-y-10">
                                <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Prediction</span>
                                        </div>
                                        <RiskBadge level={aiResult.riskLevel || "LOW"} />
                                    </div>
                                    <p className="text-3xl font-serif italic">{aiResult.occupancyRate}% <span className="text-[10px] font-sans not-italic text-zinc-500 font-black uppercase tracking-widest opacity-40">Property Load</span></p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Reasoning Logic:</span>
                                    </div>
                                    <p className="text-[13px] leading-relaxed font-medium text-neutral-400 border-l border-amber-500/30 pl-6 italic">
                                        "{aiResult.reasoning}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                        <Users className="w-4 h-4 opacity-20 mb-3" />
                                        <p className="text-2xl font-serif italic">{aiResult.suggestedStaff}</p>
                                        <p className="text-[9px] uppercase font-black tracking-widest opacity-20">Suggested Force</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-right">
                                        <Building className="w-4 h-4 opacity-20 mb-3 ml-auto" />
                                        <p className="text-2xl font-serif italic">{aiResult.currentStaff}</p>
                                        <p className="text-[9px] uppercase font-black tracking-widest opacity-20">Current Shift</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={`p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between group transition-all duration-500 hover:bg-indigo-500/10`}>
                    <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Export Protocol</p>
                            <p className="text-[11px] font-medium opacity-60 italic">Broadcast roster to staff terminals.</p>
                        </div>
                    </div>
                    <button className="p-3 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
