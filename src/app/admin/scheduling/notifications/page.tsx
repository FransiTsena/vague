"use client";

import { useTheme } from "@/context/ThemeContext";
import { 
  ArrowLeft, 
  Send, 
  Mail, 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle, 
  Loader2, 
  RefreshCcw,
  Search,
  Filter,
  MessageSquare,
  Bell,
  Trash2,
  ChevronRight,
  MoreVertical,
  Target
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsManagementPage() {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);

  const [formData, setFormData] = useState({
    target: "department", // department or member
    departmentId: "",
    memberId: "",
    subject: "",
    body: "",
    priority: "STANDARD"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, deptsRes, membersRes] = await Promise.all([
        fetch("/api/admin/staffing/notifications?limit=50"),
        fetch("/api/admin/staffing/departments"),
        fetch("/api/admin/staffing/members")
      ]);
      
      if (logsRes.ok && deptsRes.ok && membersRes.ok) {
        setLogs(await logsRes.json());
        setDepartments(await deptsRes.json());
        setMembers(await membersRes.json());
      }
    } catch (err) {
      console.error("Communications sync failed:", err);
      showNotification('error', "Failed to synchronize communication logs.");
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = formData.target === 'member' 
        ? { subject: formData.subject, body: formData.body, memberId: formData.memberId }
        : { subject: formData.subject, body: formData.body, departmentId: formData.departmentId };

      const res = await fetch("/api/admin/staffing/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showNotification('success', "Communication sequence queued successfully.");
        setIsComposing(false);
        setFormData({ ...formData, subject: "", body: "" });
        fetchData();
      } else {
        const err = await res.json();
        showNotification('error', err.error || "Failed to queue sequence.");
      }
    } catch (err) {
      showNotification('error', "Operational error during communication dispatch.");
    } finally {
      setSending(false);
    }
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
                  <RefreshCcw className={`w-4 h-4 ${loading && logs.length > 0 ? 'animate-spin' : ''}`} />
                </button>
                <div className="h-4 w-[1px] bg-neutral-800" />
                <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Comm_Link v2.1</span>
            </div>
        </div>

        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 border-b border-neutral-100 dark:border-white/5 pb-12">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-8 font-light italic">
              Communication <span className="not-italic opacity-40">Hub</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base leading-relaxed font-light">
               Dispatch operational directives, personnel alerts, and departmental broadcasts. 
               Monitor communication throughput and delivery status across the property network.
            </p>
          </div>
          
          <button 
            onClick={() => setIsComposing(true)}
            className={`px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-xl ${
              isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            <Send className="w-4 h-4" /> Dispatch Directive
          </button>
        </div>

        {/* Communication Logs */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-8 mb-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
              <span>Directive Origin & Content</span>
              <div className="flex gap-12">
                 <span className="w-32">Status</span>
                 <span className="w-32">Timestamp</span>
              </div>
           </div>

           {loading && logs.length === 0 ? (
             <div className="p-40 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin opacity-20 mb-8" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Accessing Comm Archives...</span>
             </div>
           ) : logs.length === 0 ? (
             <div className={`p-32 flex flex-col items-center justify-center rounded-[32px] border border-dashed ${isDark ? "border-white/5" : "border-black/5"}`}>
                <Bell className="w-12 h-12 opacity-10 mb-8" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">No communication sequences recorded</span>
             </div>
           ) : (
             logs.map((log, idx) => (
               <motion.div 
                 key={log._id}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.02 }}
                 className={`p-8 border rounded-[32px] flex flex-col md:flex-row md:items-center justify-between group transition-all duration-500 ${
                   isDark ? "bg-[#080808] border-white/5 hover:bg-[#0c0c0c]" : "bg-white border-black/5 hover:shadow-lg"
                 }`}
               >
                  <div className="flex items-center gap-8 mb-4 md:mb-0">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                        <MessageSquare className="w-6 h-6 opacity-30" />
                     </div>
                     <div>
                        <h4 className="font-serif text-xl font-light mb-1">{log.subject}</h4>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-mono opacity-30 truncate max-w-[200px]">{log.body}</span>
                           <span className={`px-2 py-0.5 border rounded text-[7px] font-bold tracking-widest ${isDark ? "border-white/10 text-white/40" : "border-black/5 text-black/40"}`}>
                              {log.memberId?.name || log.departmentId?.name || "Global"}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-12">
                     <div className="w-32">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'SENT' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{log.status}</span>
                        </div>
                     </div>
                     <div className="w-32 text-right md:text-left">
                        <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
                           {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                     </div>
                     <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 opacity-40 hover:opacity-100" />
                     </button>
                  </div>
               </motion.div>
             ))
           )}
        </div>
      </div>

      {/* Compose Directive Modal */}
      <AnimatePresence>
        {isComposing && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsComposing(false)}
               className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60]"
            />
            <motion.div 
               initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 35, stiffness: 200 }}
               className={`fixed top-0 right-0 h-full w-full max-w-xl z-[70] p-12 overflow-y-auto ${
                 isDark ? "bg-[#0a0a0a] border-l border-white/5" : "bg-white border-l border-black/5"
               }`}
            >
               <div className="flex items-center justify-between mb-16">
                  <button onClick={() => setIsComposing(false)} className="p-4 rounded-full border border-white/5 hover:bg-white/5 transition-all">
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Init_Comm_Sequence</span>
               </div>

               <div className="mb-16">
                 <h2 className="font-serif text-4xl mb-6 italic">Dispatch <span className="not-italic opacity-40">Directive</span></h2>
                 <p className="text-neutral-500 font-light text-sm leading-relaxed">
                   Propagate critical operational data through the property distribution matrix.
                 </p>
               </div>

               <form onSubmit={handleSend} className="space-y-10">
                  <div className="space-y-4 pt-6">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Distribution Target</label>
                     <div className="flex gap-4">
                        {['department', 'member'].map(t => (
                          <button 
                            key={t} type="button"
                            onClick={() => setFormData({...formData, target: t})}
                            className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest border transition-all duration-500 ${
                              formData.target === t 
                                ? isDark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                                : isDark ? "border-white/10 text-white/40" : "border-black/10 text-neutral-400"
                            }`}
                          >
                             {t}
                          </button>
                        ))}
                     </div>
                  </div>

                  {formData.target === 'department' ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Domain Target</label>
                      <select 
                        required value={formData.departmentId}
                        onChange={e => setFormData({...formData, departmentId: e.target.value})}
                        className={`w-full bg-transparent border-b pb-4 text-sm font-light focus:outline-none transition-all ${isDark ? "border-white/10" : "border-black/10"}`}
                      >
                         <option value="">Select Domain...</option>
                         {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Personnel Target</label>
                      <select 
                        required value={formData.memberId}
                        onChange={e => setFormData({...formData, memberId: e.target.value})}
                        className={`w-full bg-transparent border-b pb-4 text-sm font-light focus:outline-none transition-all ${isDark ? "border-white/10" : "border-black/10"}`}
                      >
                         <option value="">Select Personnel...</option>
                         {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Directive Subject</label>
                    <input 
                      required type="text" placeholder="Designation" 
                      value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                      className={`w-full bg-transparent border-b pb-4 text-xl font-serif focus:outline-none transition-all ${isDark ? "border-white/10" : "border-black/10"}`}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Instructional Data</label>
                    <textarea 
                      required placeholder="Enter directive payload..."
                      value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})}
                      className={`w-full bg-transparent border rounded-[30px] p-8 text-sm font-light min-h-[160px] focus:outline-none transition-all ${isDark ? "border-white/10 focus:border-white/20" : "border-black/10 focus:border-black/20"}`}
                    />
                  </div>

                  <button 
                    disabled={sending}
                    className={`w-full py-6 rounded-[24px] text-[11px] font-black uppercase tracking-[0.5em] transition-all shadow-2xl ${
                      isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                    } disabled:opacity-20`}
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Commit Broadcast"}
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
