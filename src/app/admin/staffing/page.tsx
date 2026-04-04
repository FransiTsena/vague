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

  const handleAddShift = async () => {
    if (!selectedCalendarDate || !selectedDept || !shiftTitle) return;
    try {
      const res = await fetch("/api/admin/staffing/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shiftTitle,
          startsAt: new Date(selectedCalendarDate.setHours(9, 0)).toISOString(),
          endsAt: new Date(selectedCalendarDate.setHours(17, 0)).toISOString(),
          departmentId: selectedDept,
          organizerId: selectedStaffForShift || null
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
    if (!aiResult?.suggestedShifts || !selectedDept) return;
    setIsCommitting(true);
    try {
      const today = new Date();
      const promises = aiResult.suggestedShifts.map((shift: any) => {
        const [sH, sM] = shift.startTime.split(":");
        const [eH, eM] = shift.endTime.split(":");
        
        const start = new Date(today);
        start.setHours(parseInt(sH), parseInt(sM), 0, 0);
        
        const end = new Date(today);
        end.setHours(parseInt(eH), parseInt(eM), 0, 0);
        
        return fetch("/api/admin/staffing/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: shift.title,
            description: shift.description,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            departmentId: selectedDept,
            organizerId: shift.assignedStaffId || null
          })
        });
      });
      
      await Promise.all(promises);
      const eRes = await fetch(`/api/admin/staffing/events?departmentId=${selectedDept}`);
      if (eRes.ok) {
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
        body: JSON.stringify({ departmentId: selectedDept, date: new Date().toISOString() })
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
                <AnimatePresence>
                    {isAddingShift && (
                        <motion.div 
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

                <div className={`p-10 border overflow-hidden relative transition-all duration-700 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5"}`}>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-10 flex items-center gap-3 italic">
                        Personnel Predictor
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

                            <AnimatePresence>
                                {isAddingMember && (
                                    <motion.form 
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

                                {aiResult.suggestedShifts && (
                                    <div className="space-y-6 pt-6 border-t border-white/5">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Proposed Deployment Blocks</h3>
                                        <div className="space-y-3">
                                            {aiResult.suggestedShifts.map((shift: any, idx: number) => (
                                                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-amber-500/20 transition-all">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{shift.title}</span>
                                                        <span className="text-[9px] font-mono text-amber-500/60 uppercase">{shift.startTime} - {shift.endTime}</span>
                                                    </div>
                                                    <p className="text-[11px] opacity-40 italic">{shift.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={handleCommitSchedule}
                                            disabled={isCommitting}
                                            className="w-full py-5 rounded-[1.5rem] bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isCommitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                            Commit To Deployment Map
                                        </button>
                                        <p className="text-center text-[8px] uppercase tracking-widest opacity-20 font-medium">Managers can manually adjust entries in the calendar view after commitment.</p>
                                    </div>
                                )}
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
