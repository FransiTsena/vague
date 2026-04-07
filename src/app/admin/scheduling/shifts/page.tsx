"use client";

import { useTheme } from "@/context/ThemeContext";
import { 
  ArrowLeft, 
  Plus, 
  RefreshCcw,
  LayoutGrid,
  List,
  Building2,
  MoreVertical,
  Loader2,
  X,
  User,
  UserPlus,
  AlertCircle,
  Users,
  Trash2,
  CheckCircle2,
  Search,
  Calendar,
  Clock,
  Layers,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StaffingCalendar } from "@/components/StaffingCalendar";

export default function ShiftOrchestrationPage() {
  const { isDark } = useTheme();
  const [shifts, setShifts] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [isAssigning, setIsAssigning] = useState<string | null>(null); 
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, deptsRes, membersRes] = await Promise.all([
        fetch("/api/admin/staffing/events?type=SHIFT"),
        fetch("/api/admin/staffing/departments"),
        fetch("/api/admin/staffing/members")
      ]);
      
      if (shiftsRes.ok && deptsRes.ok && membersRes.ok) {
        setShifts(await shiftsRes.json());
        setDepartments(await deptsRes.json());
        setMembers(await membersRes.json());
      }
    } catch (err) {
      showNotification('error', "Sync failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Close the shift options menu when clicking outside it
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => setOpenMenu(null);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  const showNotification = (type: 'success'|'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const deptId = shift.departmentId?._id || shift.departmentId;
      return selectedDept === "all" || deptId === selectedDept;
    });
  }, [shifts, selectedDept]);

  const handleAssign = async (shiftId: string, memberId: string, action: 'add' | 'remove' = 'add') => {
    try {
      const res = await fetch("/api/admin/staffing/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: shiftId, memberId, action })
      });
      if (res.ok) {
        const updated = await res.json();
        setShifts(prev => prev.map(s => s._id === shiftId ? updated : s));
        setAssignmentSearch("");
        showNotification('success', action === 'add' ? "Deployed." : "Recalled.");
      }
    } catch (err) { showNotification('error', "Network error."); }
  };

  const handleAIDeploy = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/staffing/ai-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDept,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.assigned === 0 && data.alreadyStaffed > 0) {
          showNotification('success', `All ${data.alreadyStaffed} shifts already staffed.`);
        } else if (data.assigned === 0) {
          showNotification('error', 'No vacant shifts found — generate shifts first.');
        } else {
          const occStr = data.averageOccupancy != null ? ` · ${data.averageOccupancy}% avg occupancy` : '';
          showNotification(
            'success',
            `AI deployed ${data.assigned} staff across ${data.shiftsProcessed} shifts${occStr}.`
          );
        }
        fetchData();
      } else {
        showNotification('error', data.error || "AI assignment failed.");
      }
    } catch (err) {
      showNotification('error', "Network error during AI deploy.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearShift = async (shiftId: string) => {
    setOpenMenu(null);
    try {
      const res = await fetch(`/api/admin/staffing/events?id=${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffIds: [] }),
      });
      if (res.ok) {
        setShifts(prev => prev.map(s => s._id === shiftId ? { ...s, staffIds: [] } : s));
        showNotification('success', "Assignments cleared.");
      } else {
        showNotification('error', "Failed to clear assignments.");
      }
    } catch { showNotification('error', "Network error."); }
  };

  const handleCheckIn = async (shiftId: string) => {
    setOpenMenu(null);
    try {
      const res = await fetch(`/api/admin/staffing/events?id=${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (res.ok) {
        // Only update the status field — don't replace the whole object
        // because the PATCH response doesn't populate staffIds
        setShifts(prev => prev.map(s => s._id === shiftId ? { ...s, status: "PUBLISHED" } : s));
        showNotification('success', "Shift marked as checked in.");
      } else {
        showNotification('error', "Failed to update status.");
      }
    } catch { showNotification('error', "Network error."); }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const getStatusColor = (s: string) => s === 'PUBLISHED' ? 'text-emerald-500 bg-emerald-500/5' : 'text-amber-500 bg-amber-500/5';

  const groupedShifts = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredShifts.forEach(shift => {
      const date = new Date(shift.startsAt).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(shift);
    });
    return groups;
  }, [filteredShifts]);

  const activeShift = shifts.find(s => s._id === isAssigning);
  const filteredMembers = members.filter(m => {
    if (activeShift?.staffIds?.some((s: any) => s._id === m._id)) return false;
    return m.name.toLowerCase().includes(assignmentSearch.toLowerCase());
  });

  return (
    <main className={`min-h-screen pb-12 pt-6 px-4 md:px-8 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/scheduling" className="p-2 hover:bg-neutral-500/10 rounded-full transition-colors">
                  <ArrowLeft className="w-4 h-4 opacity-40" />
              </Link>
              <div>
                <h1 className="text-xl font-medium tracking-tight">Shift Orchestration</h1>
                <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Logistics Matrix</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <div className={`flex rounded-lg p-0.5 border ${isDark ? 'bg-neutral-900 border-white/10' : 'bg-neutral-100 border-black/5'}`}>
                   <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-black shadow-sm') : (isDark ? 'text-neutral-500 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-700')}`} title="Grid Matrix"><LayoutGrid className="w-3.5 h-3.5" /></button>
                   <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-black shadow-sm') : (isDark ? 'text-neutral-500 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-700')}`} title="Deployment Stream"><List className="w-3.5 h-3.5" /></button>
                   <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-black shadow-sm') : (isDark ? 'text-neutral-500 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-700')}`} title="Strategic Map"><Layers className="w-3.5 h-3.5" /></button>
                </div>
                <button 
                  onClick={fetchData} 
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200' : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700'}`}
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                <button 
                  onClick={handleAIDeploy}
                  disabled={isGenerating}
                  title="AI analyses available staff and automatically assigns the best-fit person to each vacant shift"
                  className={`ml-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all flex items-center gap-2 ${
                    isDark 
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40" 
                    : "bg-indigo-50 border-indigo-200 text-indigo-600 disabled:opacity-40"
                  }`}
                >
                  <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Assigning...' : 'AI Deploy'}
                </button>
            </div>
        </div>

        {/* Dense Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
           <div className="flex items-center gap-3">
              <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-neutral-500/5 border border-white/5 rounded-lg text-[11px] font-bold uppercase tracking-wider appearance-none focus:outline-none focus:border-white/20 transition-all cursor-pointer"
                  >
                    <option value="all">Global Matrix</option>
                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                  </select>
              </div>
              <div className={`h-4 w-[1px] mx-2 hidden sm:block ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
              <span className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>{filteredShifts.length} Vectors Logged</span>
           </div>
        </div>

        {/* Views */}
        {loading && shifts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center opacity-20">
            <Loader2 className="w-6 h-6 animate-spin mb-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Calibrating...</span>
          </div>
        ) : viewMode === 'map' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border ${isDark ? "bg-[#080808] border-white/5 shadow-2xl" : "bg-white border-black/5 shadow-xl"}`}
          >
            <StaffingCalendar 
              items={filteredShifts} 
              onDayClick={(date) => {
                const dateStr = date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                });
                setExpandedDates({ [dateStr]: true });
                setViewMode('grid');
                // Scroll to date handled by browser if we add IDs
              }}
            />
          </motion.div>
        ) : filteredShifts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-20">
            <AlertCircle className="w-6 h-6 mb-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">No Active Vectors Detected</span>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedShifts).map(([date, shiftsOnDate]) => (
              <div key={date} className="space-y-6">
                <div 
                  className="flex items-center gap-4 cursor-pointer group/date"
                  onClick={() => toggleDate(date)}
                >
                  <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap transition-opacity ${isDark ? 'text-neutral-500 group-hover/date:text-neutral-200' : 'text-neutral-400 group-hover/date:text-neutral-700'}`}>{date}</h2>
                  <div className={`h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-500/10 to-transparent ${isDark ? 'via-neutral-800' : 'via-neutral-200'}`} />
                  <div className={`p-1 rounded-md transition-transform duration-300 ${isDark ? 'bg-neutral-900 text-neutral-500' : 'bg-neutral-100 text-neutral-400'} ${expandedDates[date] === false ? "-rotate-90" : ""}`}>
                    <MoreVertical className="w-3 h-3" />
                  </div>
                </div>
                
                <AnimatePresence initial={true}>
                  {expandedDates[date] !== false && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-2" : "space-y-2 pb-2"}>
                        {shiftsOnDate.map((shift) => (
                          <motion.div 
                            key={shift._id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setIsAssigning(shift._id)}
                            className={`group p-5 border rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                              isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-emerald-500/5" : "bg-white border-black/5 shadow-sm"
                            }`}
                          >
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase ${getStatusColor(shift.status)}`}>
                                    {shift.status || 'ACTV'}
                                  </span>
                                  <span className="text-[9px] font-mono opacity-20 truncate ml-2 uppercase tracking-tighter">
                                    {shift.departmentId?.name}
                                  </span>
                                </div>
                                
                                <h3 className="text-sm font-medium mb-1 truncate text-white tracking-tight">{shift.title}</h3>
                                
                                <div className={`flex flex-col gap-1.5 mb-5 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px] font-mono whitespace-nowrap">{formatTime(shift.startsAt)} - {formatTime(shift.endsAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Search className="w-3 h-3" />
                                    <span className="text-[9px] uppercase font-bold tracking-[0.1em] truncate max-w-[150px]">
                                      {shift.shiftType || 'Custom'} coverage
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-1.5">
                                    {shift.staffIds?.slice(0, 3).map((s: any, idx: number) => (
                                      <div 
                                        key={s._id} 
                                        className={`w-6 h-6 rounded-full border border-[#0a0a0a] bg-red flex items-center justify-center transition-transform hover:scale-110 cursor-pointer`}
                                        style={{ zIndex: 10 - idx }}
                                        title={s.name}
                                      >
                                        <span className="text-[8px] font-black pointer-events-none">{s.name?.charAt(0)}</span>
                                      </div>
                                    ))}
                                    {(!shift.staffIds || shift.staffIds.length === 0) && (
                                      <div className="flex items-center gap-1.5 text-amber-500/40">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest italic">Vacant</span>
                                      </div>
                                    )}
                                  </div>
                                  {shift.staffIds?.length > 3 && (
                                    <span className="text-[9px] font-mono opacity-20">+{shift.staffIds.length - 3}</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <div 
                                    className={`p-2 rounded-lg transition-all ${
                                      isDark ? "bg-white/5 group-hover:bg-white/10 text-white/40 group-hover:text-white" : "bg-black/5 group-hover:bg-black/10 text-black/40 group-hover:text-black"
                                    }`}
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="relative">
                                    <button 
                                      className={`p-2 rounded-lg transition-all ${
                                        openMenu === shift._id
                                          ? (isDark ? 'bg-white/10 opacity-100' : 'bg-black/10 opacity-100')
                                          : 'opacity-0 group-hover:opacity-40 hover:!opacity-100'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenu(openMenu === shift._id ? null : shift._id);
                                      }}
                                      title="Shift options"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>

                                    <AnimatePresence>
                                      {openMenu === shift._id && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                          transition={{ duration: 0.12 }}
                                          className={`absolute bottom-8 right-0 z-[100] w-48 rounded-xl border shadow-2xl overflow-hidden ${
                                            isDark ? 'bg-[#111] border-white/10' : 'bg-white border-black/10'
                                          }`}
                                          onClick={(e) => e.stopPropagation()}
                                          onMouseDown={(e) => e.stopPropagation()}
                                        >
                                          <div className={`px-3 py-2 border-b ${
                                            isDark ? 'border-white/5' : 'border-black/5'
                                          }`}>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Shift Options</p>
                                          </div>
                                          <button
                                            onClick={() => handleCheckIn(shift._id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold text-left transition-colors ${
                                              isDark
                                                ? 'hover:bg-emerald-500/10 text-white/80 hover:text-emerald-400'
                                                : 'hover:bg-emerald-50 text-neutral-700 hover:text-emerald-600'
                                            }`}
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                            Mark as Checked In
                                          </button>
                                          <button
                                            onClick={() => handleClearShift(shift._id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold text-left transition-colors border-t ${
                                              isDark
                                                ? 'border-white/5 hover:bg-rose-500/10 text-white/60 hover:text-rose-400'
                                                : 'border-black/5 hover:bg-rose-50 text-neutral-500 hover:text-rose-500'
                                            }`}
                                          >
                                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                            Clear Assignments
                                          </button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>


      <AnimatePresence>
        {isAssigning && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }} 
             className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
           >
              <motion.div 
                initial={{ scale: 0.98, y: 10 }} 
                animate={{ scale: 1, y: 0 }} 
                className={`w-full max-w-4xl rounded-[2.5rem] p-10 border shadow-2xl flex flex-col md:flex-row gap-10 max-h-[85vh] relative overflow-hidden ${isDark ? "bg-[#080808] border-white/5" : "bg-white border-black/10 text-black"}`}
              >
                 {/* Visual Decor */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10" />

                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col mb-8">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                        <h2 className="text-xl font-medium tracking-tight">Active Deployment</h2>
                      </div>
                      <p className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">{activeShift?.title} // {activeShift?.departmentId?.name}</p>
                    </div>

                    <div className="space-y-3">
                      {activeShift?.staffIds?.map((s: any) => (
                        <motion.div 
                          layout
                          key={s._id} 
                          className="p-4 rounded-2xl flex items-center justify-between bg-white/[0.02] border border-white/5 group transition-colors hover:border-emerald-500/20"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-xs">
                              {s.name?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12px] font-semibold tracking-wide">{s.name}</span>
                              <span className="text-[9px] opacity-30 uppercase font-bold tracking-widest">{s.role || 'Personnel'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleAssign(activeShift._id, s._id, 'remove')} 
                            className="p-2.5 rounded-xl text-rose-500/20 group-hover:text-rose-500 group-hover:bg-rose-500/5 transition-all"
                            title="Recall from Shift"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                      {(!activeShift?.staffIds || activeShift?.staffIds.length === 0) && (
                        <div className="py-12 flex flex-col items-center opacity-20">
                          <AlertCircle className="w-8 h-8 mb-4" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Personnel Deployed</span>
                        </div>
                      )}
                    </div>
                 </div>

                 <div className="w-[1px] bg-white/5 self-stretch hidden md:block" />

                 <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="relative mb-8 pt-2">
                        <Search className="absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 w-4 h-4 opacity-20" />
                        <input 
                          autoFocus 
                          type="text" 
                          placeholder="SEARCH ROSTER..." 
                          value={assignmentSearch} 
                          onChange={(e) => setAssignmentSearch(e.target.value)} 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[11px] font-bold tracking-widest focus:outline-none focus:border-emerald-500/40 transition-all uppercase" 
                        />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredMembers.length === 0 ? (
                           <div className="py-10 text-center opacity-20">
                              <p className="text-[10px] uppercase font-bold tracking-[0.2em]">No eligible candidates</p>
                           </div>
                        ) : filteredMembers.map((m) => (
                            <button 
                              key={m._id} 
                              onClick={() => handleAssign(activeShift?._id, m._id, 'add')} 
                              className="w-full p-4 rounded-2xl flex items-center justify-between bg-white/[0.01] border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors">
                                    <UserPlus className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-[11px] font-black uppercase tracking-tight">{m.name}</span>
                                      <span className="text-[9px] opacity-30 font-bold uppercase tracking-widest">{m.role}</span>
                                  </div>
                                </div>
                                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => setIsAssigning(null)} 
                   className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 transition-colors opacity-30 hover:opacity-100"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-6 right-6 z-[300] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-xl backdrop-blur-xl border ${notification.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
