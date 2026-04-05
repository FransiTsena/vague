"use client";

import { useTheme } from "@/context/ThemeContext";
import { 
  ArrowLeft, 
  Building2, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw,
  Trash2,
  Users,
  Calendar,
  Layers,
  Search,
  ChevronRight,
  MoreVertical,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DepartmentsManagementPage() {
  const { isDark } = useTheme();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staffing/departments");
      if (res.ok) {
        setDepartments(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      showNotification('error', "Failed to synchronize domain registry.");
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

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staffing/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showNotification('success', "Domain successfully initialized.");
        setIsAddingDept(false);
        setFormData({ name: "", description: "" });
        fetchData();
      } else {
        const err = await res.json();
        showNotification('error', err.error || "Failed to commit domain.");
      }
    } catch (err) {
      showNotification('error', "Operational error during domain commitment.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepts = useMemo(() => {
    return departments.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

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
                  <RefreshCcw className={`w-4 h-4 ${loading && departments.length > 0 ? 'animate-spin' : ''}`} />
                </button>
                <div className="h-4 w-[1px] bg-neutral-800" />
                <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Registry v1.2</span>
            </div>
        </div>

        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 border-b border-neutral-100 dark:border-white/5 pb-12">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-8 font-light italic">
              Operational <span className="not-italic opacity-40">Domains</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base leading-relaxed font-light">
               Hierarchical architecture of property departments. Define operational silos, 
               manage personnel clusters, and oversee cross-functional resource allocation.
            </p>
          </div>
          
          <button 
            onClick={() => setIsAddingDept(true)}
            className={`px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-xl ${
              isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            <Plus className="w-4 h-4" /> Initialize Domain
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-12">
           <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 opacity-20" />
           <input 
             type="text" 
             placeholder="Search Operational Registry..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className={`w-full bg-transparent border rounded-full px-14 py-4 text-xs font-light tracking-widest focus:outline-none transition-all ${
               isDark ? "border-white/10 focus:border-white/30" : "border-black/5 focus:border-black/20"
             }`}
           />
        </div>

        {/* Department Grid */}
        {loading && departments.length === 0 ? (
          <div className="p-40 flex flex-col items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin opacity-20 mb-8" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Synchronizing Global Domains...</span>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className={`p-32 flex flex-col items-center justify-center rounded-[32px] border border-dashed ${isDark ? "border-white/5" : "border-black/5 opacity-50"}`}>
             <Layers className="w-12 h-12 opacity-10 mb-8" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">No domains detected in this matrix</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredDepts.map((dept, idx) => (
               <motion.div 
                 key={dept._id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className={`group relative p-10 border rounded-[40px] flex flex-col justify-between transition-all duration-700 ${
                   isDark ? "bg-[#080808] border-white/5 hover:border-white/10" : "bg-white border-black/5 hover:shadow-2xl"
                 }`}
               >
                  <div className="mb-12">
                     <div className="flex items-center justify-between mb-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                           <Building2 className={`w-6 h-6 ${isDark ? "text-white/40" : "text-black/40"}`} />
                        </div>
                        <div className={`px-3 py-1 border rounded-full text-[8px] font-bold tracking-widest uppercase ${isDark ? "border-white/10 text-white/30" : "border-black/5 text-black/30"}`}>
                           Active Domain
                        </div>
                     </div>
                     
                     <h3 className="font-serif text-3xl font-light mb-4 group-hover:italic transition-all duration-500">{dept.name}</h3>
                     <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed line-clamp-2">
                        {dept.description || "Experimental operational silent sector. No narrative brief provided."}
                     </p>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-neutral-100 dark:border-white/5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Personnel</span>
                              <div className="flex items-center gap-2">
                                 <Users className="w-3 h-3 opacity-30" />
                                 <span className="text-xs font-mono">{dept._count?.members || 0}</span>
                              </div>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Protocols</span>
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-3 h-3 opacity-30" />
                                 <span className="text-xs font-mono">{dept._count?.events || 0}</span>
                              </div>
                           </div>
                        </div>

                        <Link 
                          href={`/admin/scheduling/roster?departmentId=${dept._id}`}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-700 ${
                            isDark ? "border-white/5 hover:bg-white text-black" : "border-black/5 hover:bg-black text-white"
                          }`}
                        >
                           <ChevronRight className="w-4 h-4" />
                        </Link>
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      <AnimatePresence>
        {isAddingDept && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsAddingDept(false)}
               className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60]"
            />
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-[70] p-12 rounded-[48px] border ${
                 isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-black/5 shadow-2xl"
               }`}
            >
               <div className="flex items-center justify-between mb-12">
                  <h2 className="font-serif text-3xl italic">Domain <span className="not-italic opacity-40">Init</span></h2>
                  <button onClick={() => setIsAddingDept(false)} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
                     <XCircle className="w-6 h-6" />
                  </button>
               </div>

               <form onSubmit={handleAddDept} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Domain Designation</label>
                    <input 
                      required type="text" placeholder="e.g. Concierge & Guest Experience" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className={`w-full bg-transparent border rounded-[20px] px-8 py-5 text-lg font-serif focus:outline-none transition-all ${isDark ? "border-white/10 focus:border-white/20" : "border-black/10 focus:border-black/20"}`}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Narrative Brief</label>
                    <textarea 
                      placeholder="Define the operational boundaries and objectives of this domain..."
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      className={`w-full bg-transparent border rounded-[30px] p-8 text-sm font-light min-h-[160px] focus:outline-none transition-all ${isDark ? "border-white/10 focus:border-white/20" : "border-black/10 focus:border-black/20"}`}
                    />
                  </div>

                  <button 
                    disabled={loading}
                    className={`w-full py-6 rounded-[24px] text-[11px] font-black uppercase tracking-[0.5em] transition-all shadow-2xl ${
                      isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                    } disabled:opacity-20`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Commit Domain to Registry"}
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
