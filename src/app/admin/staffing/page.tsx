"use client";

import { useEffect, useState, useMemo } from "react";
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
  Plus,
  X,
  Clock,
  LayoutGrid,
  List,
  RefreshCcw,
  Search,
  Filter,
  BarChart3
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StaffingCalendar, CalendarItem } from "@/components/StaffingCalendar";

const RiskBadge = ({ level, isDark }: { level: string, isDark: boolean }) => {
  const isHigh = level.toLowerCase() === "high";
  const isMed = level.toLowerCase() === "medium";
  const colorClass = isHigh ? "text-rose-500 border-rose-500/20" : isMed ? "text-amber-500 border-amber-500/20" : "text-emerald-500 border-emerald-500/20";
  const dotClass = isHigh ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-emerald-500";
  
  return (
    <div className={`px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-3 rounded-full transition-all duration-700 ${
      isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-black/10 text-black shadow-sm"
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotClass}`} />
      <span className={isDark ? "opacity-60" : colorClass.split(' ')[0]}>{level} DEPLOYMENT RISK</span>
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
  const [selectedDept, setSelectedDept] = useState("all");
  const [viewMode, setViewMode] = useState<'calendar' | 'analytics'>('calendar');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, deptsRes] = await Promise.all([
        fetch("/api/admin/staffing/events"),
        fetch("/api/admin/staffing/departments")
      ]);
      
      if (eventsRes.ok && deptsRes.ok) {
        const events = await eventsRes.json();
        const depts = await deptsRes.json();
        
        const calendarItems: CalendarItem[] = events.map((e: any) => ({
          _id: e._id,
          title: e.title,
          description: e.description,
          startsAt: e.startsAt,
          endsAt: e.endsAt,
          type: e.type,
          departmentId: e.departmentId
            ? {
                _id: String(e.departmentId?._id || e.departmentId),
                name: e.departmentId?.name || "Operations",
              }
            : undefined,
          organizerId: e.organizerId
            ? {
                _id: String(e.organizerId?._id || e.organizerId),
                name: e.organizerId?.name || "",
                email: e.organizerId?.email || "",
              }
            : undefined,
          shiftType: e.shiftType,
          status: e.status,
        }));
        
        setItems(calendarItems);
        setDepartments(depts);
      }
    } catch (err) {
      console.error("Operational sync failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runAIAnalysis = async () => {
    setAiLoading(true);
    try {
      // Simulated AI Intelligence Engine
      await new Promise(r => setTimeout(r, 2000));
      setAiResult({
        efficiency: 94,
        recommendation: "Increase morning shift allocation in 'Concierge & Guest Relations' by 15% for next Tuesday to align with predicted high-occupancy archival check-ins.",
        risk: "Low"
      });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return selectedDept === "all"
      ? items
      : items.filter((i) => i.departmentId?.name === selectedDept);
  }, [items, selectedDept]);

  return (
    <main className={`min-h-screen pb-20 pt-8 md:pt-12 px-6 sm:px-12 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/admin/scheduling" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.3em] opacity-40 hover:opacity-100 transition-all">
                <ArrowLeft className="w-3 h-3" /> Dynamics Terminal
            </Link>
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1 border rounded-full p-1 transition-colors ${
                  isDark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-neutral-100'
                }`}>
                   <button 
                     onClick={() => setViewMode('calendar')}
                     className={`p-1.5 rounded-full transition-all ${
                       viewMode === 'calendar' 
                         ? (isDark ? 'bg-white text-black' : 'bg-black text-white') 
                         : (isDark ? 'text-neutral-500 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-700')
                     }`}
                   >
                      <LayoutGrid className="w-3.5 h-3.5" />
                   </button>
                   <button 
                     onClick={() => setViewMode('analytics')}
                     className={`p-1.5 rounded-full transition-all ${
                       viewMode === 'analytics' 
                         ? (isDark ? 'bg-white text-black' : 'bg-black text-white') 
                         : (isDark ? 'text-neutral-500 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-700')
                     }`}
                   >
                      <BarChart3 className="w-3.5 h-3.5" />
                   </button>
                </div>
                <div className={`h-4 w-[1px] mx-2 ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                <button 
                   onClick={fetchData}
                   className={`p-2 transition-all rounded-full ${
                     isDark ? 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
                   }`}
                >
                  <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>

        {/* Hero & Intelligence Hub */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16 border-b border-neutral-100 dark:border-white/5 pb-16">
          <div className="max-w-3xl">
            <h1 className="font-serif text-6xl md:text-8xl tracking-tighter mb-8 italic">
              Deployment <span className={`not-italic font-sans font-light ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Map</span>
            </h1>
            <p className={`text-lg md:text-xl leading-relaxed font-light ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
               Spatio-temporal visualization of property personnel. Orchestrate coverage flows and 
               analyze operational density across the hierarchical staffing matrix.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-12 items-center">
               <div className={`flex items-center gap-4 px-6 py-3 rounded-full border ${isDark ? "border-white/10" : "border-black/5"}`}>
                  <Building className="w-4 h-4 opacity-30" />
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-transparent text-[11px] font-black uppercase tracking-widest focus:outline-none cursor-pointer pr-4"
                  >
                     <option value="all" className="bg-black text-white">Consolidated View</option>
                     {departments.map(d => (
                       <option key={d._id} value={d.name} className="bg-black text-white">{d.name}</option>
                     ))}
                  </select>
               </div>
               
               <button 
                 onClick={runAIAnalysis}
                 disabled={aiLoading}
                 className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all duration-700 shadow-xl overflow-hidden relative group ${
                   isDark ? "bg-amber-400 text-black hover:bg-amber-300" : "bg-black text-white hover:bg-neutral-800"
                 }`}
               >
                 {aiLoading ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                 ) : (
                   <Brain className="w-4 h-4 transition-transform group-hover:scale-110" />
                 )}
                 <span>{aiLoading ? "Synthesizing Data" : "Compute Optimal Density"}</span>
               </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {aiResult && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`lg:w-96 p-8 rounded-3xl border self-start relative overflow-hidden backdrop-blur-xl ${
                  isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10 shadow-xl"
                }`}
              >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                     <Brain className="w-32 h-32" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8">
                     <RiskBadge level={aiResult.risk} isDark={isDark} />
                     <div className="flex-1 h-[1px] bg-neutral-100 dark:bg-white/5" />
                     <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{aiResult.efficiency}% Efficiency</div>
                  </div>
                  
                  <h4 className="font-serif text-xl font-light mb-4 text-foreground">Intelligence <span className="italic">Observation</span></h4>
                  <p className={`text-[13px] leading-relaxed font-light mb-8 italic ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    "{aiResult.recommendation}"
                  </p>
                  
                  <button className="w-full py-4 rounded-xl border border-dashed border-neutral-300 dark:border-white/10 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                     Apply Optimization
                  </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Calendar Core */}
        <div className={`w-full rounded-[40px] overflow-hidden border theme-transition ${
          isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-black/5 shadow-2xl"
        }`}>
          {isLoading ? (
            <div className="p-60 flex flex-col items-center justify-center">
               <Loader2 className="w-8 h-8 animate-spin opacity-20 mb-8" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Hydrating Temporal Data...</span>
            </div>
          ) : viewMode === 'calendar' ? (
             <StaffingCalendar 
               items={filteredItems} 
             />
          ) : (
            <div className="p-40 flex flex-col items-center justify-center opacity-20 italic">
               <BarChart3 className="w-12 h-12 mb-6" />
               <span className="font-serif text-3xl font-light">Advanced Analytics Hub under construction.</span>
            </div>
          )}
        </div>
        
        {/* Footer Metrics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Network Coverage', value: '98.4%', icon: ShieldCheck, color: 'text-emerald-500' },
             { label: 'Active Deployments', value: filteredItems.length, icon: Users, color: 'text-indigo-500' },
             { label: 'SLA Adherence', value: 'High', icon: CheckCircle2, color: 'text-amber-500' }
           ].map((stat, i) => (
             <div key={i} className={`p-8 rounded-3xl border flex items-center gap-6 transition-all duration-700 ${
               isDark ? "bg-white/[0.02] border-white/5 hover:border-white/10" : "bg-white border-black/5 hover:shadow-lg"
             }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                   <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</div>
                   <div className="text-2xl font-serif font-light">{stat.value}</div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </main>
  );
}
