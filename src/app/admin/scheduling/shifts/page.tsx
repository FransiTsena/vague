"use client";

import { useTheme } from "@/context/ThemeContext";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Plus, 
  RefreshCcw,
  Zap,
  LayoutGrid,
  List,
  Building2,
  MoreVertical,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  User,
  Check,
  ChevronRight,
  UserPlus,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShiftOrchestrationPage() {
  const { isDark } = useTheme();
  const [shifts, setShifts] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAssigning, setIsAssigning] = useState<string | null>(null); 
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generationWeeks, setGenerationWeeks] = useState(1);
  const [showAIModal, setShowAIModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, deptsRes, membersRes] = await Promise.all([
        fetch("/api/admin/staffing/events?type=SHIFT"),
        fetch("/api/admin/staffing/departments"),
        fetch("/api/admin/staffing/members")
      ]);
      
      if (shiftsRes.ok && deptsRes.ok && membersRes.ok) {
        const shiftsData = await shiftsRes.json();
        const deptsData = await deptsRes.json();
        const membersData = await membersRes.json();
        setShifts(shiftsData);
        setDepartments(deptsData);
        setMembers(membersData);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      showNotification('error', "Failed to synchronize matrix parameters.");
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

  const handleAssign = async (shiftId: string, memberId: string) => {
    try {
      const res = await fetch("/api/admin/staffing/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: shiftId, memberId })
      });

      if (res.ok) {
        const updatedShift = await res.json();
        setShifts(prev => prev.map(s => s._id === shiftId ? updatedShift : s));
        setIsAssigning(null);
        setAssignmentSearch("");
        showNotification('success', "Personnel assigned successfully.");
      } else {
        showNotification('error', "Assignment protocols failed.");
      }
    } catch (err) {
      showNotification('error', "Network disruption during assignment.");
    }
  };

  const handleAiGeneration = async () => {
    if (selectedDept === "all") {
      showNotification('error', "Select a department vector for AI orchestration.");
      return;
    }

    setIsGeneratingAI(true);
    setShowAIModal(false);
    
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + (generationWeeks * 7));

      const res = await fetch("/api/admin/staffing/ai-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          departmentId: selectedDept,
          date: today.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      });

      if (!res.ok) throw new Error("AI engine failed to respond.");

      const prediction = await res.json();
      
      const shiftsToCreate: any[] = [];
      prediction.forEach((day: any) => {
        day.suggestedShifts.forEach((s: any) => {
          const shiftStart = new Date(`${day.date}T${s.startTime}:00`);
          const shiftEnd = new Date(`${day.date}T${s.endTime}:00`);
          if (s.endTime < s.startTime) shiftEnd.setDate(shiftEnd.getDate() + 1);

          shiftsToCreate.push({
            title: s.title,
            description: day.reasoning,
            startsAt: shiftStart.toISOString(),
            endsAt: shiftEnd.toISOString(),
            departmentId: selectedDept,
            type: "SHIFT",
            status: "DRAFT"
          });
        });
      });

      const batchRes = await fetch("/api/admin/staffing/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: shiftsToCreate })
      });

      if (batchRes.ok) {
        showNotification('success', `AI orchestrated ${shiftsToCreate.length} shifts across ${generationWeeks} week(s).`);
        fetchData();
      } else {
        throw new Error("Failed to commit shifts to registry.");
      }
    } catch (err: any) {
      showNotification('error', err.message || "AI orchestration protocols failed.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

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

  const activeShift = shifts.find(s => s._id === isAssigning);
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    m.role?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    m.departmentId?.name?.toLowerCase().includes(assignmentSearch.toLowerCase())
  );

  return (
    <main className={`min-h-screen pb-12 pt-6 md:pt-8 px-4 sm:px-8 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin/scheduling" className="inline-flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] opacity-40 hover:opacity-100 transition-all">
                <ArrowLeft className="w-2.5 h-2.5" /> Logistics Engine
            </Link>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border border-neutral-800/20 dark:border-neutral-800 rounded-full p-0.5">
                   <button 
                     onClick={() => setViewMode('grid')}
                     className={`p-1 rounded-full transition-all ${viewMode === 'grid' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm' : 'opacity-30 hover:opacity-100'}`}
                   >
                      <LayoutGrid className="w-2.5 h-2.5" />
                   </button>
                   <button 
                     onClick={() => setViewMode('list')}
                     className={`p-1 rounded-full transition-all ${viewMode === 'list' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm' : 'opacity-30 hover:opacity-100'}`}
                   >
                      <List className="w-2.5 h-2.5" />
                   </button>
                </div>
                <div className="h-3 w-[1px] bg-neutral-800/20 dark:bg-neutral-800 mx-1" />
                <button 
                  onClick={fetchData}
                  className="p-1.5 opacity-40 hover:opacity-100 transition-opacity"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${loading && shifts.length > 0 ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 border-b border-neutral-100 dark:border-white/5 pb-8">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
              Shift <span className="text-neutral-500 italic">Orchestration</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm leading-relaxed font-light">
              Hierarchical timeline management for property operations. Coordinate coverage and personnel assignments.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowAIModal(true)}
              disabled={isGeneratingAI}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 border shadow-md ${
                isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-black"
              }`}
            >
              {isGeneratingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />} 
              AI Orchestration
            </button>
            <button className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 shadow-lg ${
              isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
            }`}>
              <Plus className="w-3.5 h-3.5" /> New Allocation
            </button>
          </div>
        </div>

        {/* Filter Architecture */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
           <div className={`flex items-center gap-3 px-6 py-3 rounded-full border ${isDark ? "border-white/10" : "border-black/5"}`}>
              <Building2 className="w-3.5 h-3.5 opacity-40 text-black dark:text-white" />
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer pr-2 text-black dark:text-white"
              >
                 <option value="all" className="bg-neutral-900 text-white">All Departments</option>
                 {departments.map(dept => (
                   <option key={dept._id} value={dept._id} className="bg-neutral-900 text-white">{dept.name}</option>
                 ))}
              </select>
           </div>
           
           <div className="hidden lg:flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest opacity-30 text-black dark:text-white">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span>Synchronization Active</span>
              </div>
              <div className="w-0.5 h-0.5 rounded-full bg-neutral-800" />
              <span>{filteredShifts.length} Operational Units</span>
           </div>
        </div>

        {/* Shifts Display */}
        {loading && shifts.length === 0 ? (
          <div className={`p-20 flex flex-col items-center justify-center border border-dashed rounded-2xl ${isDark ? "border-white/5" : "border-black/5"}`}>
             <Loader2 className="w-6 h-6 animate-spin opacity-20 mb-4" />
             <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20">Synchronizing Global Timelines...</span>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className={`p-16 flex flex-col items-center justify-center ${isDark ? "bg-white/[0.02]" : "bg-black/[0.02]" } rounded-2xl border border-dashed ${isDark ? "border-white/5" : "border-black/5"}`}>
             <Zap className="w-6 h-6 opacity-10 mb-6" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 text-center uppercase">No shifts detected</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredShifts.map((shift, idx) => (
               <motion.div 
                 key={shift._id}
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.01 }}
                 className={`group p-6 border rounded-2xl flex flex-col justify-between transition-all duration-500 ${
                   isDark ? "bg-[#080808] border-white/5 hover:border-white/10" : "bg-white border-black/5 hover:border-black/10 shadow-sm"
                 }`}
               >
                  <div>
                     <div className="flex items-center justify-between mb-4">
                        <div className={`px-2 py-0.5 border rounded-full text-[7px] font-bold tracking-widest uppercase ${getStatusColor(shift.status)}`}>
                           {shift.status || 'ACTIVE'}
                        </div>
                        <span className="text-[8px] font-mono tracking-widest opacity-20">{shift.departmentId?.name}</span>
                     </div>
                     
                     <h3 className="font-serif text-xl font-light tracking-tight mb-1 group-hover:italic transition-all duration-500 text-black dark:text-white">
                        {shift.title}
                     </h3>
                     <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-4 line-clamp-2">
                        {shift.description || 'System-generated coverage protocols.'}
                     </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-white/5">
                     <div className="flex flex-col gap-1.5 mr-2 text-black dark:text-white">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-3 h-3 opacity-30" />
                           <span className="text-[9px] uppercase font-bold tracking-widest">{formatDate(shift.startsAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Clock className="w-3 h-3 opacity-30" />
                           <span className="text-[9px] font-mono tracking-[0.1em]">{formatTime(shift.startsAt)} — {formatTime(shift.endsAt)}</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-black dark:text-white">
                           {shift.organizerId ? (
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"}`}>
                                    <User className="w-2.5 h-2.5 opacity-40" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[9px] font-black uppercase tracking-tight truncate max-w-[100px]">{shift.organizerId.name}</span>
                                    <span className="text-[7px] opacity-40 uppercase tracking-widest truncate max-w-[100px]">{shift.organizerId.email}</span>
                                </div>
                              </div>
                           ) : (
                              <div className="flex items-center gap-1.5 text-rose-500/50">
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span className="text-[8px] font-bold uppercase tracking-widest italic">Unassigned</span>
                              </div>
                           )}
                        </div>
                        
                        <div className="flex items-center gap-0.5">
                            <button 
                                onClick={() => setIsAssigning(shift._id)}
                                className={`p-1.5 rounded-full transition-all duration-300 ${
                                isDark ? "hover:bg-white/5 text-white/30 hover:text-white" : "hover:bg-black/5 text-black/30 hover:text-black"
                                }`}
                                title="Change Assignment"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                            </button>
                            <button className={`p-1.5 rounded-full transition-all duration-300 opacity-20 group-hover:opacity-100 text-black dark:text-white ${
                            isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                            }`}>
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>
        ) : (
          <div className="space-y-2">
             {filteredShifts.map((shift, idx) => (
               <div key={shift._id} className={`p-6 border rounded-2xl flex items-center justify-between group transition-all duration-500 ${
                 isDark ? "bg-[#080808] border-white/5 hover:bg-[#111]" : "bg-white border-black/5 hover:border-neutral-50 shadow-sm"
               }`}>
                  <div className="flex items-center gap-8 text-black dark:text-white">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                        <Clock className="w-5 h-5 opacity-40 text-neutral-400" />
                     </div>
                     <div>
                        <h4 className="font-serif text-lg font-light">{shift.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                           <span className={`px-2 py-0.5 border rounded text-[7px] font-bold tracking-widest ${getStatusColor(shift.status)}`}>{shift.status || 'ACTIVE'}</span>
                           <span className="text-[9px] font-mono tracking-widest opacity-30 uppercase">{shift.departmentId?.name}</span>
                           <span className="w-1 h-1 rounded-full bg-neutral-800" />
                           <span className="text-[9px] font-bold tracking-tight opacity-40 uppercase">{shift.organizerId?.name || "UNASSIGNED"}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-12 text-black dark:text-white">
                     <div className="text-right flex flex-col gap-1">
                        <span className="text-[10px] font-mono tracking-[0.2em]">{formatTime(shift.startsAt)} — {formatTime(shift.endsAt)}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-20">{formatDate(shift.startsAt)}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsAssigning(shift._id)}
                            className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-800 rounded-full text-white"
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>
                        <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 opacity-40 hover:opacity-100" />
                        </button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Assignment Modal Overlay */}
      <AnimatePresence>
        {isAssigning && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80"
           >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`w-full max-w-2xl rounded-[3rem] p-12 border overflow-hidden relative ${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-black/10 text-black"}`}
              >
                 <button 
                    onClick={() => setIsAssigning(null)}
                    className="absolute top-8 right-8 p-3 opacity-40 hover:opacity-100 hover:rotate-90 transition-all duration-500 text-black dark:text-white"
                 >
                    <X className="w-6 h-6" />
                 </button>

                 <div className="mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 block mb-4 text-black dark:text-white">Allocation Protocols</span>
                    <h2 className="font-serif text-4xl mb-2 text-black dark:text-white">Assign <span className="italic">Personnel</span></h2>
                    <p className="text-sm opacity-50 font-light text-black dark:text-white">{activeShift?.title} • {activeShift?.departmentId?.name}</p>
                 </div>

                 <div className="relative mb-8">
                    <input 
                       type="text"
                       placeholder="SEARCH ROSTER BY NAME OR ROLE..."
                       value={assignmentSearch}
                       onChange={(e) => setAssignmentSearch(e.target.value)}
                       className={`w-full bg-transparent border-b pb-4 text-xs font-bold tracking-widest focus:outline-none placeholder:opacity-20 text-black dark:text-white ${isDark ? "border-white/10" : "border-black/10"}`}
                    />
                 </div>

                 <div className="max-h-[40vh] overflow-y-auto pr-4 space-y-2 custom-scrollbar">
                    {filteredMembers.map((member) => (
                       <button
                         key={member._id}
                         onClick={() => handleAssign(isAssigning, member._id)}
                         className={`w-full p-6 rounded-2xl flex items-center justify-between transition-all group ${
                           isDark ? "bg-white/[0.02] hover:bg-white/5" : "bg-black/[0.02] hover:bg-black/5"
                         }`}
                       >
                          <div className="flex items-center gap-6">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                               activeShift?.organizerId?._id === member._id 
                                ? "bg-emerald-500 border-emerald-500 text-black" 
                                : isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black font-medium"
                             }`}>
                                {activeShift?.organizerId?._id === member._id ? <Check className="w-4 h-4" /> : <User className="w-4 h-4 opacity-40" />}
                             </div>
                             <div className="text-left">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-black dark:text-white">{member.name}</h4>
                                <span className="text-[9px] opacity-40 uppercase tracking-widest text-black dark:text-white">{member.role} • {member.departmentId?.name}</span>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-all -translate-x-4 group-hover:translate-x-0 text-black dark:text-white" />
                       </button>
                    ))}
                    {filteredMembers.length === 0 && (
                        <div className="py-12 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">No personnel found in Registry</div>
                    )}
                 </div>

                 <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
                    <p className="text-[9px] font-mono tracking-widest opacity-20 uppercase text-black dark:text-white">Personnel verification active</p>
                    <button 
                        onClick={() => setIsAssigning(null)}
                        className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 text-black dark:text-white"
                    >
                        Dismiss
                    </button>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* AI Orchestration Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-xl rounded-[3rem] p-12 border overflow-hidden relative ${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-black/10 text-black"}`}
            >
              <button 
                onClick={() => setShowAIModal(false)}
                className="absolute top-8 right-8 p-3 opacity-40 hover:opacity-100 hover:rotate-90 transition-all duration-500 text-black dark:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-10 text-center">
                <div className="bg-amber-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-amber-500 fill-amber-500/20" />
                </div>
                <h2 className="font-serif text-3xl mb-2">Initialize AI <span className="italic">Staffing</span></h2>
                <p className="text-xs opacity-50 font-light max-w-sm mx-auto">
                  The AI engine will analyze occupancy trajectories and bookings to optimize shift allocations for the selected vectors.
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest opacity-40">Horizon Scope</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setGenerationWeeks(num)}
                        className={`py-6 rounded-2xl border text-[11px] font-bold transition-all ${
                          generationWeeks === num 
                            ? isDark ? "bg-white text-black border-white shadow-xl shadow-white/5 scale-105" : "bg-black text-white border-black shadow-xl scale-105"
                            : isDark ? "border-white/5 bg-white/5 hover:bg-white/10" : "border-neutral-100 bg-neutral-50 hover:bg-neutral-100"
                        }`}
                      >
                        {num} WEEK{num > 1 ? 'S' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest opacity-40">Target Vector</label>
                  <div className={`p-6 rounded-2xl border flex items-center justify-between ${isDark ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200"}`}>
                    <span className="text-xs font-bold uppercase tracking-widest italic opacity-60">
                      {selectedDept === "all" ? "SELECT DEPARTMENT IN MAIN VIEW" : departments.find(d => d._id === selectedDept)?.name}
                    </span>
                    <Building2 className="w-4 h-4 opacity-40" />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-4">
                <button 
                  onClick={handleAiGeneration}
                  disabled={selectedDept === "all"}
                  className={`w-full py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all shadow-xl disabled:opacity-30 ${
                    isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                  }`}
                >
                  Confirm Orchestration
                </button>
                <p className="text-[8px] font-mono text-center opacity-20 uppercase tracking-[0.2em]">Matrix protocols initialized through GROQ Deep-Learning Engine</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 border backdrop-blur-2xl ${
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
