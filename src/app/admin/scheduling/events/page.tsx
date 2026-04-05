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
  Building2,
  AlertCircle,
  ArrowUpRight,
  Search,
  Trash2,
  Target,
  Users
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EventsManagementPage() {
  const { isDark } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    departmentId: "",
    organizerId: "",
    startsAt: "",
    endsAt: "",
    type: "EVENT",
    status: "PUBLISHED"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, deptsRes, membersRes] = await Promise.all([
        fetch("/api/admin/staffing/events?type=EVENT"),
        fetch("/api/admin/staffing/departments"),
        fetch("/api/admin/staffing/members")
      ]);
      
      if (eventsRes.ok && deptsRes.ok && membersRes.ok) {
        setEvents(await eventsRes.json());
        setDepartments(await deptsRes.json());
        setMembers(await membersRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      showNotification('error', "Failed to synchronize event protocol.");
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

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staffing/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showNotification('success', "Event successfully protocolized.");
        setIsAddingEvent(false);
        setFormData({
          title: "",
          description: "",
          departmentId: "",
          organizerId: "",
          startsAt: "",
          endsAt: "",
          type: "EVENT",
          status: "PUBLISHED"
        });
        fetchData();
      } else {
        const err = await res.json();
        showNotification('error', err.error || "Failed to commit event.");
      }
    } catch (err) {
      showNotification('error', "Operational error during commitment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Terminate this event record?")) return;
    try {
      const res = await fetch(`/api/admin/staffing/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', "Event record terminated.");
        fetchData();
      }
    } catch (err) {
      showNotification('error', "Failed to terminate event.");
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const deptId = event.departmentId?._id || event.departmentId;
      const matchesDept = selectedDept === "all" || deptId === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [events, searchQuery, selectedDept]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  return (
    <main className={`min-h-screen pb-20 pt-8 md:pt-12 px-6 sm:px-12 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/admin/scheduling" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.3em] opacity-40 hover:opacity-100 transition-all">
                <ArrowLeft className="w-3 h-3" /> Dynamics Terminal
            </Link>
            <div className="flex items-center gap-6">
                <button 
                  onClick={fetchData}
                  className="p-2 opacity-40 hover:opacity-100 transition-opacity"
                >
                  <RefreshCcw className={`w-4 h-4 ${loading && events.length > 0 ? 'animate-spin' : ''}`} />
                </button>
                <div className="h-4 w-[1px] bg-neutral-800" />
                <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Protocol v1.0</span>
            </div>
        </div>

        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 border-b border-neutral-100 dark:border-white/5 pb-12">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-8 font-light italic">
              Property <span className="not-italic opacity-40">Events</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base leading-relaxed font-light">
               Manage high-fidelity property engagements, VIP arrivals, and operational activations. 
               Coordinate cross-departmental events through the unified protocol engine.
            </p>
          </div>
          
          <button 
            onClick={() => setIsAddingEvent(true)}
            className={`px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-xl ${
              isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            <Plus className="w-4 h-4" /> Initialize Protocol
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
           <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 opacity-20" />
              <input 
                type="text" 
                placeholder="Search Protocol..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent border rounded-full px-14 py-4 text-xs font-light tracking-widest focus:outline-none transition-all ${
                  isDark ? "border-white/10 focus:border-white/30" : "border-black/5 focus:border-black/20"
                }`}
              />
           </div>
           
           <div className={`flex items-center gap-3 px-6 py-4 rounded-full border ${isDark ? "border-white/10" : "border-black/5"}`}>
              <Building2 className="w-3.5 h-3.5 opacity-40" />
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-xs font-light pr-4 tracking-widest focus:outline-none cursor-pointer"
              >
                 <option value="all">All Domains</option>
                 {departments.map(dept => (
                   <option key={dept._id} value={dept._id}>{dept.name}</option>
                 ))}
              </select>
           </div>
        </div>

        {/* Event List */}
        {loading && events.length === 0 ? (
          <div className="p-40 flex flex-col items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin opacity-20 mb-8" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Hydrating Operational State...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className={`p-32 flex flex-col items-center justify-center rounded-[32px] border border-dashed ${isDark ? "border-white/5" : "border-black/5 opacity-50"}`}>
             <Target className="w-12 h-12 opacity-10 mb-8" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">No active protocols detected</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredEvents.map((event, idx) => (
               <motion.div 
                 key={event._id}
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.03 }}
                 className={`group p-8 border rounded-3xl flex flex-col justify-between transition-all duration-700 ${
                   isDark ? "bg-[#080808] border-white/5 hover:border-white/10" : "bg-white border-black/5 hover:shadow-xl"
                 }`}
               >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                       <span className={`px-2 py-1 rounded text-[7px] font-bold tracking-widest ${
                         isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
                       }`}>
                          {event.departmentId?.name || "Global"}
                       </span>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-30">{event.type}</span>
                       </div>
                    </div>

                    <h3 className="font-serif text-2xl font-light tracking-tight mb-4 group-hover:italic transition-all duration-500">
                       {event.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-8 line-clamp-3">
                       {event.description || "Experimental protocol activation. No brief provided."}
                    </p>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-neutral-100 dark:border-white/5">
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                           <Calendar className="w-3.5 h-3.5 opacity-30" />
                           <span className="text-[10px] uppercase font-bold tracking-widest">{formatDate(event.startsAt)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Clock className="w-3.5 h-3.5 opacity-30" />
                           <span className="text-[10px] font-mono tracking-[0.2em]">{formatTime(event.startsAt)} — {formatTime(event.endsAt)}</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-[10px] ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                              {event.organizerId?.name?.[0] || 'S'}
                           </div>
                           <span className="text-[9px] font-mono tracking-widest opacity-40 uppercase truncate max-w-[100px]">
                              {event.organizerId?.name || "System"}
                           </span>
                        </div>

                        <button 
                          onClick={() => handleDeleteEvent(event._id)}
                          className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all ${
                            isDark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500"
                          }`}
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddingEvent && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsAddingEvent(false)}
               className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60]"
            />
            <motion.div 
               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 30, stiffness: 200 }}
               className={`fixed top-0 right-0 h-full w-full max-w-xl z-[70] p-12 overflow-y-auto ${
                 isDark ? "bg-[#0a0a0a] border-l border-white/5" : "bg-white border-l border-black/5"
               }`}
            >
               <div className="flex items-center justify-between mb-16">
                  <button onClick={() => setIsAddingEvent(false)} className="p-4 rounded-full border border-white/5 hover:bg-white/5 transition-all">
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Init_Protocol_Sequence</span>
               </div>

               <div className="mb-16">
                 <h2 className="font-serif text-4xl mb-6 italic">Event <span className="not-italic opacity-40">Orchestration</span></h2>
                 <p className="text-neutral-500 font-light text-sm leading-relaxed">
                   Synchronize cross-departmental activations and VIP itineraries.
                 </p>
               </div>

               <form onSubmit={handleAddEvent} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Activation Title</label>
                    <input 
                      required type="text" placeholder="Protocol Designation" 
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className={`w-full bg-transparent border-b pb-4 text-2xl font-serif focus:outline-none focus:border-neutral-500 transition-all ${isDark ? "border-white/10" : "border-black/10"}`}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Operational Narrative</label>
                    <textarea 
                      placeholder="Protocol brief and objectives..."
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      className={`w-full bg-transparent border rounded-2xl p-6 text-sm font-light min-h-[120px] focus:outline-none transition-all ${isDark ? "border-white/10" : "border-black/10"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Domain Anchor</label>
                        <select 
                          required value={formData.departmentId}
                          onChange={e => setFormData({...formData, departmentId: e.target.value})}
                          className={`w-full bg-transparent border-b pb-4 text-sm font-light focus:outline-none transition-all ${isDark ? "border-white/10" : "border-black/10"}`}
                        >
                           <option value="">Select Domain...</option>
                           {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Protocol Lead</label>
                        <select 
                          value={formData.organizerId}
                          onChange={e => setFormData({...formData, organizerId: e.target.value})}
                          className={`w-full bg-transparent border-b pb-4 text-sm font-light focus:outline-none transition-all ${isDark ? "border-white/10" : "border-black/10"}`}
                        >
                           <option value="">System Default</option>
                           {members.filter(m => !formData.departmentId || m.departmentId?._id === formData.departmentId).map(m => (
                             <option key={m._id} value={m._id}>{m.name}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Sync Start</label>
                        <input 
                           required type="datetime-local"
                           value={formData.startsAt} onChange={e => setFormData({...formData, startsAt: e.target.value})}
                           className={`w-full bg-transparent border-b pb-4 text-xs font-mono focus:outline-none ${isDark ? "border-white/10" : "border-black/10"}`}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Sync Termination</label>
                        <input 
                           required type="datetime-local"
                           value={formData.endsAt} onChange={e => setFormData({...formData, endsAt: e.target.value})}
                           className={`w-full bg-transparent border-b pb-4 text-xs font-mono focus:outline-none ${isDark ? "border-white/10" : "border-black/10"}`}
                        />
                     </div>
                  </div>

                  <button 
                    disabled={loading}
                    className={`w-full py-6 text-[11px] font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 ${
                      isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                    } disabled:opacity-20`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit Protocol"}
                  </button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 border backdrop-blur-2xl ${
              notification.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
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
