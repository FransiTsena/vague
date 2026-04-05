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
  Clock
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

  const showNotification = (type: 'success'|'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
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

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const getStatusColor = (s: string) => s === 'PUBLISHED' ? 'text-emerald-500 bg-emerald-500/5' : 'text-amber-500 bg-amber-500/5';

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
                <p className="text-[10px] uppercase tracking-widest opacity-30 font-bold">Logistics Matrix</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex bg-neutral-500/5 rounded-lg p-0.5 border border-white/5">
                   <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'opacity-40'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
                   <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white/10 text-white' : 'opacity-40'}`}><List className="w-3.5 h-3.5" /></button>
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-neutral-500/5 rounded-lg transition-colors"><RefreshCcw className={`w-3.5 h-3.5 opacity-40 ${loading ? 'animate-spin' : ''}`} /></button>
                <button className="ml-2 px-4 py-2 bg-white text-black text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Allocation
                </button>
            </div>
        </div>

        {/* Dense Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
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
           <div className="h-4 w-[1px] bg-white/10 mx-2 hidden sm:block" />
           <span className="text-[10px] font-mono opacity-20 uppercase tracking-widest">{filteredShifts.length} Units Synchronized</span>
        </div>

        {/* Dense Grid */}
        {loading && shifts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center opacity-20"><Loader2 className="w-6 h-6 animate-spin mb-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Calibrating...</span></div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-2"}>
             {filteredShifts.map((shift) => (
               <motion.div 
                 key={shift._id}
                 layout
                 className={`group p-5 border rounded-2xl flex flex-col justify-between transition-all ${
                   isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-black/5 shadow-sm"
                 }`}
               >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase ${getStatusColor(shift.status)}`}>{shift.status || 'ACTV'}</span>
                      <span className="text-[9px] font-mono opacity-20 truncate ml-2 uppercase">{shift.departmentId?.name}</span>
                    </div>
                    <h3 className="text-sm font-medium mb-1 truncate text-white">{shift.title}</h3>
                    <div className="flex items-center gap-3 opacity-30 mb-4">
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /><span className="text-[10px] font-mono whitespace-nowrap">{formatTime(shift.startsAt)} - {formatTime(shift.endsAt)}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex -space-x-2">
                       {shift.staffIds?.slice(0, 3).map((s: any) => (
                         <div key={s._id} className="w-6 h-6 rounded-full border border-[#0a0a0a] bg-neutral-800 flex items-center justify-center" title={s.name}><User className="w-2.5 h-2.5 opacity-30" /></div>
                       ))}
                       {(!shift.staffIds || shift.staffIds.length === 0) && <div className="text-[9px] opacity-20 italic">Vacant</div>}
                    </div>
                    <button onClick={() => setIsAssigning(shift._id)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors opacity-40 group-hover:opacity-100"><Users className="w-3.5 h-3.5" /></button>
                  </div>
               </motion.div>
             ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAssigning && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
              <motion.div initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }} className={`w-full max-w-3xl rounded-3xl p-8 border shadow-2xl flex flex-col md:flex-row gap-8 max-h-[85vh] ${isDark ? "bg-[#0d0d0d] border-white/10" : "bg-white border-black/10 text-black"}`}>
                 <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-medium">Deployment</h2>
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">{activeShift?.title}</span>
                    </div>
                    <div className="space-y-2">
                      {activeShift?.staffIds?.map((s: any) => (
                        <div key={s._id} className="p-3 rounded-xl flex items-center justify-between bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><User className="w-3.5 h-3.5 opacity-30" /></div>
                            <span className="text-[11px] font-medium tracking-wide">{s.name}</span>
                          </div>
                          <button onClick={() => handleAssign(activeShift._id, s._id, 'remove')} className="p-2 text-rose-500/40 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="w-[1px] bg-white/5 self-stretch hidden md:block" />

                 <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-20" />
                        <input autoFocus type="text" placeholder="DEPLOY STAFF..." value={assignmentSearch} onChange={(e) => setAssignmentSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-medium focus:outline-none focus:border-white/20 transition-all" />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 px-0.5">
                        {filteredMembers.map((m) => (
                            <button key={m._id} onClick={() => handleAssign(activeShift?._id, m._id, 'add')} className="w-full p-3 rounded-xl flex items-center gap-3 bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all text-left group">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10"><UserPlus className="w-3.5 h-3.5 opacity-30" /></div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-medium">{m.name}</span>
                                    <span className="text-[9px] opacity-30 uppercase tracking-widest">{m.role}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
                 <button onClick={() => setIsAssigning(null)} className="absolute top-4 right-4 p-2 opacity-20 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
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
