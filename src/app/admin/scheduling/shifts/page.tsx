"use client";

import { useTheme } from "@/context/ThemeContext";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  MoreVertical, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw,
  Zap,
  LayoutGrid,
  List,
  Building2,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShiftOrchestrationPage() {
  const { isDark } = useTheme();
  const [shifts, setShifts] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, deptsRes] = await Promise.all([
        fetch("/api/admin/staffing/events?type=SHIFT"),
        fetch("/api/admin/staffing/departments")
      ]);
      
      if (shiftsRes.ok && deptsRes.ok) {
        const shiftsData = await shiftsRes.json();
        const deptsData = await deptsRes.json();
        setShifts(shiftsData);
        setDepartments(deptsData);
      }
    } catch (err) {
      console.error("Failed to fetch shift data:", err);
      showNotification('error', "Failed to synchronize operational timelines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type: 'success'|'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const deptId = shift.departmentId?._id || shift.departmentId;
      return selectedDept === "all" || deptId === selectedDept;
    });
  }, [shifts, selectedDept]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'DRAFT': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20';
    }
  };

  return (
    <main className={`min-h-screen pb-20 pt-8 md:pt-12 px-6 sm:px-12 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/admin/scheduling" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.3em] opacity-40 hover:opacity-100 transition-all">
                <ArrowLeft className="w-3 h-3" /> Logistics Engine
            </Link>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 border border-neutral-800 rounded-full p-1">
                   <button 
                     onClick={() => setViewMode('grid')}
                     className={`p-1.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'opacity-40 hover:opacity-100'}`}
                   >
                      <LayoutGrid className="w-3 h-3" />
                   </button>
                   <button 
                     onClick={() => setViewMode('list')}
                     className={`p-1.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'opacity-40 hover:opacity-100'}`}
                   >
                      <List className="w-3 h-3" />
                   </button>
                </div>
                <div className="h-4 w-[1px] bg-neutral-800 mx-2" />
                <button 
                  onClick={fetchData}
                  className="p-2 opacity-40 hover:opacity-100 transition-opacity"
                >
                  <RefreshCcw className={`w-4 h-4 ${loading && shifts.length > 0 ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 border-b border-neutral-100 dark:border-white/5 pb-12">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-8">
              Shift <span className="text-neutral-500 italic">Orchestration</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base leading-relaxed font-light">
              Hierarchical timeline management for property operations. Coordinate departmental coverage, 
              artisanal allocations, and high-fidelity shift dynamics through the unified operational matrix.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button className={`px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-xl ${
              isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
            }`}>
              <Plus className="w-4 h-4" /> New Allocation
            </button>
          </div>
        </div>

        {/* Filter Architecture */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
           <div className={`flex items-center gap-4 px-8 py-4 rounded-full border ${isDark ? "border-white/10" : "border-black/5"}`}>
              <Building2 className="w-4 h-4 opacity-40" />
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-[11px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer pr-4"
              >
                 <option value="all">All Departments</option>
                 {departments.map(dept => (
                   <option key={dept._id} value={dept._id}>{dept.name}</option>
                 ))}
              </select>
           </div>
           
           <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest opacity-40">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span>84% Coverage</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <span>{filteredShifts.length} Active Shifts</span>
           </div>
        </div>

        {/* Shifts Display */}
        {loading && shifts.length === 0 ? (
          <div className={`p-40 flex flex-col items-center justify-center border border-dashed rounded-3xl ${isDark ? "border-white/5" : "border-black/5"}`}>
             <Loader2 className="w-8 h-8 animate-spin opacity-20 mb-6" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">Synchronizing Global Timelines...</span>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className={`p-32 flex flex-col items-center justify-center ${isDark ? "bg-white/[0.02]" : "bg-black/[0.02]"} rounded-3xl border border-dashed ${isDark ? "border-white/5" : "border-black/5"}`}>
             <Zap className="w-8 h-8 opacity-10 mb-8" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-center">No operational shifts detected in this matrix</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredShifts.map((shift, idx) => (
               <motion.div 
                 key={shift._id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.03 }}
                 className={`group p-8 border rounded-3xl flex flex-col justify-between transition-all duration-700 ${
                   isDark ? "bg-[#080808] border-white/5 hover:border-white/10" : "bg-white border-black/5 hover:border-black/10 shadow-sm"
                 }`}
               >
                  <div>
                     <div className="flex items-center justify-between mb-8">
                        <div className={`px-3 py-1 border rounded-full text-[8px] font-bold tracking-widest uppercase ${getStatusColor(shift.status)}`}>
                           {shift.status || 'ACTIVE'}
                        </div>
                        <span className="text-[9px] font-mono tracking-widest opacity-30">{shift.departmentId?.name}</span>
                     </div>
                     
                     <h3 className="font-serif text-2xl font-light tracking-tight mb-2 group-hover:italic transition-all duration-500">
                        {shift.title}
                     </h3>
                     <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-8 line-clamp-2">
                        {shift.description || 'No operational brief provided.'}
                     </p>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-neutral-100 dark:border-white/5">
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                           <Calendar className="w-3.5 h-3.5 opacity-30" />
                           <span className="text-[10px] uppercase font-bold tracking-widest">{formatDate(shift.startsAt)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Clock className="w-3.5 h-3.5 opacity-30" />
                           <span className="text-[10px] font-mono tracking-[0.2em]">{formatTime(shift.startsAt)} — {formatTime(shift.endsAt)}</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between">
                        <div className="flex -space-x-3">
                           {[1, 2].map((i) => (
                             <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                               isDark ? "bg-neutral-900 border-[#080808]" : "bg-neutral-100 border-white font-medium"
                             }`}>
                                <span className="text-[9px]">{shift.organizerId?.name?.[0] || 'S'}</span>
                             </div>
                           ))}
                           <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                             isDark ? "bg-neutral-800 border-[#080808]" : "bg-neutral-200 border-white"
                           }`}>
                              +3
                           </div>
                        </div>
                        
                        <button className={`p-2 rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100 ${
                          isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
                        }`}>
                           <MoreVertical className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>
        ) : (
          <div className="space-y-2">
             {filteredShifts.map((shift, idx) => (
               <div key={shift._id} className={`p-6 border rounded-2xl flex items-center justify-between group transition-all duration-500 ${
                 isDark ? "bg-[#080808] border-white/5 hover:bg-[#0c0c0c]" : "bg-white border-black/5 hover:bg-neutral-50"
               }`}>
                  <div className="flex items-center gap-8">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                        <Clock className="w-5 h-5 opacity-40 text-neutral-400" />
                     </div>
                     <div>
                        <h4 className="font-serif text-lg font-light">{shift.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                           <span className={`px-2 py-0.5 border rounded text-[7px] font-bold tracking-widest ${getStatusColor(shift.status)}`}>{shift.status || 'ACTIVE'}</span>
                           <span className="text-[9px] font-mono tracking-widest opacity-30 uppercase">{shift.departmentId?.name}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                     <div className="text-right flex flex-col gap-1">
                        <span className="text-[10px] font-mono tracking-[0.2em]">{formatTime(shift.startsAt)} — {formatTime(shift.endsAt)}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-20">{formatDate(shift.startsAt)}</span>
                     </div>
                     <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 opacity-40 hover:opacity-100" />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 border backdrop-blur-2xl ${
              notification.type === 'success' 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
