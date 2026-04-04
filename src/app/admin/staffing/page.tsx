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
  Building,
  Plus,
  X
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
  const [members, setMembers] = useState<any[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "", departmentId: "" });
  const [isCommitting, setIsCommitting] = useState(false);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [shiftTitle, setShiftTitle] = useState("");
  const [selectedStaffForShift, setSelectedStaffForShift] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState<"morning" | "swing" | "night">("morning");
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [dayDetailDate, setDayDetailDate] = useState<Date | null>(null);
  const [dayItems, setDayItems] = useState<CalendarItem[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const handleDayClick = (date: Date, items: CalendarItem[]) => {
    setDayDetailDate(date);
    setDayItems(items);
    setIsDayOpen(true);
  };

  const handleAddShift = async () => {
    if (!selectedCalendarDate || !selectedDept || !shiftTitle) return;
    try {
      const startsAt = new Date(selectedCalendarDate);
      const endsAt = new Date(selectedCalendarDate);

      if (selectedShiftType === "morning") {
        startsAt.setHours(7, 0, 0, 0);
        endsAt.setHours(15, 0, 0, 0);
      } else if (selectedShiftType === "swing") {
        startsAt.setHours(15, 0, 0, 0);
        endsAt.setHours(23, 0, 0, 0);
      } else {
        startsAt.setHours(23, 0, 0, 0);
        endsAt.setDate(endsAt.getDate() + 1);
        endsAt.setHours(7, 0, 0, 0);
      }

      const res = await fetch("/api/admin/staffing/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shiftTitle,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          departmentId: selectedDept,
          organizerId: selectedStaffForShift || null,
          type: "SHIFT",
          shiftType: selectedShiftType,
          status: "PUBLISHED"
        })
      });
      if (res.ok) {
        setIsAddingShift(false);
        setShiftTitle("");
        setSelectedStaffForShift("");
        const eRes = await fetch(`/api/admin/staffing/events?departmentId=${selectedDept}`);
        const data = await eRes.json();
        setItems(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteShift = async (item: any) => {
    if (!item._id) return;
    try {
      const res = await fetch(`/api/admin/staffing/events?id=${item._id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const eRes = await fetch(`/api/admin/staffing/events?departmentId=${selectedDept}`);
        const data = await eRes.json();
        setItems(data || []);
        // Also update day items if day detail is open
        if (dayDetailDate) {
          const dateStr = dayDetailDate.toISOString().split('T')[0];
          setDayItems(data.filter((i: any) => i.startsAt.startsWith(dateStr)));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async (deptId: string) => {
    try {
      const res = await fetch(`/api/admin/staffing/members?departmentId=${deptId}`);
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMembers([]);
    }
  };

  const handleCommitSchedule = async () => {
    if (!aiResult?.predictions && !aiResult?.suggestedShifts) return;
    setIsCommitting(true);
    try {
      const shiftsToCreate: any[] = [];
      const predictions = aiResult.predictions || [aiResult];

      predictions.forEach((pred: any) => {
        // AI might return results for multiple days in its predictions array
        const date = new Date(pred.date || new Date());
        
        if (pred.suggestedShifts) {
          pred.suggestedShifts.forEach((shift: any) => {
            const [sH, sM] = (shift.startTime || "09:00").split(":");
            const [eH, eM] = (shift.endTime || "17:00").split(":");
            
            const start = new Date(date);
            start.setHours(parseInt(sH), parseInt(sM), 0, 0);
            
            const end = new Date(date);
            end.setHours(parseInt(eH), parseInt(eM), 0, 0);
            
            // Handle overnight shifts (Night Shift)
            if (end <= start) {
              end.setDate(end.getDate() + 1);
            }

            shiftsToCreate.push({
              title: shift.title || "Allocated Staff",
              description: pred.reasoning || shift.description,
              startsAt: start.toISOString(),
              endsAt: end.toISOString(),
              departmentId: selectedDept,
              organizerId: shift.assignedStaffId || null,
              type: "SHIFT",
              shiftType: shift.shiftType || "morning",
              status: "DRAFT"
            });
          });
        }
      });
      
      const res = await fetch("/api/admin/staffing/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shiftsToCreate)
      });

      if (res.ok) {
        const eRes = await fetch(`/api/admin/staffing/events?departmentId=${selectedDept}`);
        const evts = await eRes.json();
        setItems(evts || []);
      }
      setAiResult(null); // Clear after commit
    } catch (e) {
      console.error(e);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/staffing/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMember, departmentId: selectedDept })
      });
      if (res.ok) {
        setNewMember({ name: "", email: "", role: "", departmentId: "" });
        setIsAddingMember(false);
        fetchMembers(selectedDept);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiForecast = async () => {
    if (!selectedDept) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/staffing/ai-predict", {
        method: "POST",
        body: JSON.stringify({ 
          departmentId: selectedDept, 
          date: startDate,
          endDate: endDate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeptChange = async (id: string) => {
    setSelectedDept(id);
    fetchMembers(id);
    try {
      const eRes = await fetch(`/api/admin/staffing/events?departmentId=${id}`);
      if (eRes.ok) {
        const evts = await eRes.json();
        setItems(Array.isArray(evts) ? evts : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const dRes = await fetch("/api/admin/staffing/departments");
        const depts = dRes.ok ? await dRes.json() : [];
        setDepartments(depts || []);
        
        if (depts?.length) {
          const firstId = depts[0]._id;
          setSelectedDept(firstId);
          fetchMembers(firstId);
          
          const eRes = await fetch(`/api/admin/staffing/events?departmentId=${firstId}`);
          if (eRes.ok) {
            const evts = await eRes.json();
            setItems(Array.isArray(evts) ? evts : []);
          }
        }
      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-12">
      <div className="max-w-[1400px] w-full mx-auto space-y-12">
        <div className="h-20 w-1/3 bg-white/5 animate-pulse rounded-[2rem]" />
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-12">
            <div className="h-[600px] bg-white/5 animate-pulse rounded-[3rem]" />
            <div className="h-[600px] bg-white/5 animate-pulse rounded-[3rem]" />
        </div>
      </div>
    </div>
  );

  return (
    <main className={`min-h-screen pt-6 pb-20 px-6 sm:px-12 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Navigation / Metadata */}
        <div className="flex items-center justify-between mb-6">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                <ArrowLeft className="w-3 h-3" /> Personnel Overview
            </Link>
            <div className="flex items-center gap-6">
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
                    <StaffingCalendar 
                      items={items} 
                      onDayClick={handleDayClick}
                      onAddEvent={(date) => {
                        setSelectedCalendarDate(date);
                        setIsAddingShift(true);
                        setShiftTitle("");
                      }}
                      onDeleteEvent={(item) => handleDeleteShift(item)}
                    />
                </div>
            </div>

            {/* AI Control Center */}
            <div className="xl:sticky xl:top-28 space-y-8">
                <AnimatePresence mode="wait">
                    {isDayOpen && (
                        <motion.div
                          key="day-orchestration"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`rounded-[3rem] p-10 border relative overflow-hidden ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-2xl"}`}
                        >
                            <button onClick={() => setIsDayOpen(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2 flex items-center gap-3 italic">
                                <Calendar className="w-4 h-4" /> Daily Orchestration
                            </h2>
                            <p className="text-2xl font-serif italic text-zinc-100 mb-8">{dayDetailDate?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            
                            <div className="space-y-8">
                                {['morning', 'swing', 'night'].map(type => {
                                    const shifts = dayItems.filter(i => i.shiftType === type);
                                    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
                                    const colorClass = type === 'morning' ? 'text-sky-500' : type === 'swing' ? 'text-amber-500' : 'text-indigo-500';
                                    
                                    return (
                                        <div key={type} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`text-[9px] font-black uppercase tracking-widest ${colorClass}`}>
                                                    {typeLabel} Shift
                                                </h3>
                                                <span className="text-[9px] font-mono opacity-20">{shifts.length} Personnel</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {shifts.map((s, idx) => (
                                                    <div key={s._id || `shift-${idx}`} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group/shift transition-colors hover:border-amber-500/20">
                                                        <div>
                                                            <p className="text-xs font-bold text-zinc-100 mb-1">{s.organizerId?.name || "Unassigned"}</p>
                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{s.title}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteShift(s)}
                                                            className="p-2 rounded-full bg-rose-500/10 text-rose-500 opacity-0 group-hover/shift:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {shifts.length === 0 && (
                                                    <div className="py-4 border border-dashed border-white/5 rounded-2xl text-center text-[9px] font-black uppercase tracking-widest text-zinc-700">
                                                        No Deployments
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => {
                                    setSelectedCalendarDate(dayDetailDate);
                                    setIsAddingShift(true);
                                    setIsDayOpen(false);
                                }}
                                className="w-full mt-10 p-5 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-colors flex items-center justify-center gap-3"
                            >
                                <Plus className="w-4 h-4" /> Add Personnel
                            </button>
                        </motion.div>
                    )}
                    {isAddingShift && (
                        <motion.div 
                          key="add-manual-shift"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`rounded-[3rem] p-10 border relative overflow-hidden ${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50/50 border-amber-500/10 shadow-2xl shadow-amber-500/5"}`}
                        >
                            <button onClick={() => setIsAddingShift(false)} className="absolute top-8 right-8 text-amber-500/40 hover:text-amber-500"><X className="w-5 h-5" /></button>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8 flex items-center gap-3 italic">
                                <Plus className="w-4 h-4" /> Add Manual Shift
                            </h2>
                            <div className="space-y-6">
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Target Date: {selectedCalendarDate?.toDateString()}</p>
                                <input 
                                    autoFocus
                                    placeholder="Enter Shift Name (e.g. Morning Shift)"
                                    value={shiftTitle}
                                    onChange={(e) => setShiftTitle(e.target.value)}
                                    className={`w-full px-8 py-5 rounded-[1.5rem] border bg-transparent text-sm font-bold uppercase tracking-widest outline-none transition-all focus:border-amber-500/50 ${isDark ? "border-white/10" : "border-black/10"}`}
                                />
                                <div className="space-y-3">
                                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2">Shift Period</label>
                                  <select 
                                      value={selectedShiftType}
                                      onChange={(e) => setSelectedShiftType(e.target.value as any)}
                                      className={`w-full px-8 py-5 rounded-[1.5rem] border bg-transparent text-sm font-bold uppercase tracking-widest outline-none transition-all focus:border-amber-500/50 appearance-none cursor-pointer ${isDark ? "border-white/10" : "border-black/10"}`}
                                  >
                                      <option value="morning" className={isDark ? "bg-[#050505]" : "bg-white"}>Morning (07:00 - 15:00)</option>
                                      <option value="swing" className={isDark ? "bg-[#050505]" : "bg-white"}>Swing (15:00 - 23:00)</option>
                                      <option value="night" className={isDark ? "bg-[#050505]" : "bg-white"}>Night (23:00 - 07:00)</option>
                                  </select>
                                </div>
                                <div className="space-y-3">
                                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2">Assign Personnel (Optional)</label>
                                  <select 
                                      value={selectedStaffForShift}
                                      onChange={(e) => setSelectedStaffForShift(e.target.value)}
                                      className={`w-full px-8 py-5 rounded-[1.5rem] border bg-transparent text-sm font-bold uppercase tracking-widest outline-none transition-all focus:border-amber-500/50 appearance-none cursor-pointer ${isDark ? "border-white/10" : "border-black/10"}`}
                                  >
                                      <option value="" className={isDark ? "bg-[#050505]" : "bg-white"}>Auto-Assign Later</option>
                                      {members.map(m => (
                                          <option key={m._id} value={m._id} className={isDark ? "bg-[#050505]" : "bg-white"}>{m.name}</option>
                                      ))}
                                  </select>
                                </div>
                                <button 
                                  onClick={handleAddShift}
                                  className="w-full py-5 rounded-[1.5rem] bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-amber-400 transition-all font-sans"
                                >
                                  Deploy Shift
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[3rem] p-10 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-2xl shadow-black/5"}`}
                >
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 flex items-center gap-3 italic">
                        <Brain className="w-4 h-4" /> AI Workforce Modulation
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 pl-4">Start Horizon</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={`w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] uppercase font-black tracking-widest ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 pl-4">End Horizon</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={`w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] uppercase font-black tracking-widest ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
                            />
                        </div>
                    </div>
                    
                    <button 
                      onClick={handleAiForecast}
                      disabled={aiLoading}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[2rem] flex flex-col items-center gap-6 group transition-all relative overflow-hidden disabled:opacity-50 text-left"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {aiLoading ? <Loader2 className="w-10 h-10 text-amber-500 animate-spin" /> : <Brain className="w-10 h-10 text-amber-500 group-hover:scale-110 transition-transform" />}
                        <div className="text-center">
                            <span className="text-xs font-black uppercase tracking-[0.3em] block mb-1">Generate Optimized Roster</span>
                            <span className="text-[9px] opacity-40 uppercase tracking-widest">Aggregate Personnel & Occupancy</span>
                        </div>
                    </button>

                    <AnimatePresence mode="wait">
                        {aiResult && (
                            <motion.div 
                              key="ai-result-panel"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-8 space-y-6 pt-8 border-t border-white/5 overflow-hidden"
                            >
                                <RiskBadge level={aiResult.riskLevel || "LOW"} />
                                
                                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">AI Strategy Insight</p>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3 text-amber-500" />
                                            <span className="text-[9px] font-bold text-amber-500">{aiResult.occupancyRate}% Load</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-amber-500/80 leading-relaxed italic mb-4">{aiResult.reasoning || "Analyzing data..."}</p>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 rounded-xl bg-amber-500/5 flex flex-col items-center">
                                            <span className="text-lg font-serif italic text-amber-500">{aiResult.suggestedStaff}</span>
                                            <span className="text-[7px] uppercase font-black tracking-widest opacity-40">Target</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-amber-500/5 flex flex-col items-center">
                                            <span className="text-lg font-serif italic text-amber-500">{aiResult.currentStaff}</span>
                                            <span className="text-[7px] uppercase font-black tracking-widest opacity-40">Existing</span>
                                        </div>
                                    </div>
                                    
                                    {aiResult.suggestedShifts && (
                                        <div className="mt-6 pt-4 border-t border-amber-500/10 space-y-2">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-amber-500/60 mb-2">Block Details</p>
                                            {aiResult.suggestedShifts.slice(0, 3).map((s: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between text-[8px] font-mono text-amber-500/40">
                                                    <span>{s.title}</span>
                                                    <span>{s.startTime} - {s.endTime}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button 
                                  onClick={handleCommitSchedule}
                                  disabled={isCommitting}
                                  className="w-full p-6 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isCommitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    Commit & Dispatch Roster
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className={`p-10 border overflow-hidden relative transition-all duration-700 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5"}`}>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-10 flex items-center gap-3 italic">
                        Personnel Registry
                    </h2>

                    <div className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[9px] uppercase font-black tracking-[0.2em] opacity-40 block">Select Target Department</label>
                            <div className="relative group">
                                <select 
                                    value={selectedDept}
                                    onChange={(e) => handleDeptChange(e.target.value)}
                                    className={`w-full px-8 py-5 rounded-[1.5rem] border bg-transparent text-sm font-bold uppercase tracking-widest transition-all outline-none appearance-none hover:bg-white/[0.03] ${isDark ? "border-white/10" : "border-black/10"}`}
                                >
                                    {departments.map(d => <option className="bg-neutral-900" key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Personnel Roster</h3>
                                <button 
                                    onClick={() => setIsAddingMember(!isAddingMember)}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <Users className="w-3 h-3" />
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {isAddingMember && (
                                    <motion.form 
                                        key="add-member-form"
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        onSubmit={handleAddMember}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <input 
                                            placeholder="FULL NAME"
                                            value={newMember.name}
                                            onChange={e => setNewMember({...newMember, name: e.target.value})}
                                            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:border-amber-500/50 outline-none"
                                        />
                                        <input 
                                            placeholder="EMAIL ADDRESS"
                                            value={newMember.email}
                                            onChange={e => setNewMember({...newMember, email: e.target.value})}
                                            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:border-amber-500/50 outline-none"
                                        />
                                        <input 
                                            placeholder="POSITION / ROLE"
                                            value={newMember.role}
                                            onChange={e => setNewMember({...newMember, role: e.target.value})}
                                            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:border-amber-500/50 outline-none"
                                        />
                                        <button className="w-full bg-white text-black py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors">
                                            Register Member
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {members.length === 0 ? (
                                    <p className="text-[9px] uppercase tracking-widest opacity-20 italic py-4">No personnel registered in this sector.</p>
                                ) : (
                                    members.map((m: any) => (
                                        <div key={m._id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">{m.name}</p>
                                                <p className="text-[9px] opacity-40 uppercase font-medium">{m.role || 'Personnel'}</p>
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                                        </div>
                                    ))
                                )}
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
                </div>

                <div className={`p-8 bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between group transition-all duration-500 hover:bg-indigo-500/10 rounded-[2rem]`}>
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
