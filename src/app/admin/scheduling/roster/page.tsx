"use client";

import { useTheme } from "@/context/ThemeContext";
import { 
  ArrowLeft, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  Shield, 
  Building2,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCcw,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StaffRosterPage() {
  const { isDark } = useTheme();
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    departmentId: "",
    password: "",
    accessRole: "MEMBER"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, deptsRes] = await Promise.all([
        fetch("/api/admin/staffing/members"),
        fetch("/api/admin/staffing/departments")
      ]);
      
      if (membersRes.ok && deptsRes.ok) {
        const membersData = await membersRes.json();
        const deptsData = await deptsRes.json();
        setStaff(membersData);
        setDepartments(deptsData);
      }
    } catch (err) {
      console.error("Failed to fetch roster data:", err);
      showNotification('error', "Failed to synchronize personnel records.");
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

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to terminate this personnel record?")) return;
    try {
      const res = await fetch(`/api/admin/staffing/members?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', "Personnel record successfully terminated.");
        fetchData();
      } else {
        showNotification('error', "Failed to terminate record.");
      }
    } catch (err) {
      showNotification('error', "Operational error during termination.");
    }
  };

  const filteredStaff = useMemo(() => {
    return staff.filter(person => {
      const name = person.name || "";
      const email = person.email || "";
      const role = person.role || "";
      
      const matchesSearch = 
        name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const deptId = person.departmentId?._id || person.departmentId;
      const matchesDept = selectedDept === "all" || deptId === selectedDept;
      
      return matchesSearch && matchesDept;
    });
  }, [staff, searchQuery, selectedDept]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staffing/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showNotification('success', "Personnel record successfully initialized.");
        setIsAddingMember(false);
        setFormData({ name: "", email: "", role: "", departmentId: "", password: "", accessRole: "MEMBER" });
        fetchData();
      } else {
        const err = await res.json();
        showNotification('error', err.error || "Failed to create record.");
      }
    } catch (err) {
      showNotification('error', "Network error during synchronization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen pb-12 pt-6 md:pt-8 px-4 sm:px-8 theme-transition ${isDark ? "bg-[#050505] text-white" : "bg-[#fcfcfc] text-neutral-900"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin/scheduling" className="inline-flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] opacity-40 hover:opacity-100 transition-all">
                <ArrowLeft className="w-2.5 h-2.5" /> Logistics Engine
            </Link>
            <div className="flex items-center gap-3">
                <button 
                  onClick={fetchData}
                  className="p-1.5 opacity-40 hover:opacity-100 transition-opacity"
                  title="Synchronize Data"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${loading && staff.length > 0 ? 'animate-spin' : ''}`} />
                </button>
                <div className="h-3 w-[1px] bg-neutral-800/20 dark:bg-neutral-800" />
                <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Registry v4.2</span>
            </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 border-b border-neutral-100 dark:border-white/5 pb-8">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-4">
              Personnel <span className="text-neutral-500 italic">Registry</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm leading-relaxed font-light">
              Unified directory of property artisans and operational leads. 
              Manage hierarchy and secure access protocols.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsAddingMember(true)}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 shadow-lg ${
                isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Initialize Record
            </button>
          </div>
        </div>

        {/* Search & Filtering Architecture */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
           <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-5 top-1/2 -translate-y-1/2 opacity-20" />
              <input 
                type="text" 
                placeholder="Search Name, Email, Role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent border rounded-full px-12 py-3 text-[11px] font-light tracking-widest focus:outline-none transition-all ${
                  isDark ? "border-white/10 focus:border-white/30" : "border-black/5 focus:border-black/20"
                }`}
              />
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className={`flex items-center gap-2 px-4 py-3 rounded-full border ${isDark ? "border-white/10" : "border-black/5"}`}>
                 <Building2 className="w-3 h-3 opacity-40" />
                 <select 
                   value={selectedDept}
                   onChange={(e) => setSelectedDept(e.target.value)}
                   className="bg-transparent text-[11px] font-light pr-2 tracking-widest focus:outline-none cursor-pointer"
                 >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                 </select>
              </div>
           </div>

           <div className="hidden lg:flex items-center gap-2 px-2 opacity-30">
              <span className="text-[9px] font-mono uppercase tracking-widest">{filteredStaff.length} Records</span>
           </div>
        </div>

        {/* Roster Display */}
        <div className="grid grid-cols-1 gap-px bg-neutral-100 dark:bg-white/5 border border-neutral-100 dark:border-white/5 overflow-hidden rounded-xl shadow-xl">
           {loading && staff.length === 0 ? (
             <div className={`p-16 flex flex-col items-center justify-center ${isDark ? "bg-[#080808]" : "bg-white"}`}>
                <Loader2 className="w-6 h-6 animate-spin opacity-20 mb-4" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20">Accessing Database...</span>
             </div>
           ) : (
             filteredStaff.map((person, idx) => (
               <motion.div 
                 key={person._id}
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.01 }}
                 className={`group relative p-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between transition-all duration-500 ${
                   isDark ? "bg-[#080808] hover:bg-[#0c0c0c]" : "bg-white hover:bg-neutral-50"
                 }`}
               >
                  <div className="flex items-center gap-5">
                     <div className="relative group">
                        <div className={`w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 transition-all duration-500 group-hover:scale-105 ${
                          isDark ? "bg-[#111] border-white/5" : "bg-neutral-100 border-black/5"
                        }`}>
                           {person.image ? (
                             <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                                <span className="text-lg font-serif text-neutral-500">{person.name ? person.name[0] : '?'}</span>
                             </div>
                           )}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isDark ? "bg-[#080808] border-[#080808]" : "bg-white border-white"
                        }`}>
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                        </div>
                     </div>
                     
                     <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                           <h3 className="font-serif text-xl font-light tracking-tight group-hover:italic transition-all duration-500">
                             {person.name}
                           </h3>
                           {person.accessRole === 'ADMIN' && (
                             <Shield className="w-3 h-3 text-amber-500/50" />
                           )}
                        </div>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[9px] font-mono uppercase tracking-[0.1em] opacity-40">
                           <span className="flex items-center gap-1.5"><Mail className="w-2.5 h-2.5" /> {person.email}</span>
                           <span className="flex items-center gap-1.5"><Building2 className="w-2.5 h-2.5" /> {person.departmentId?.name || 'Unassigned'}</span>
                           <span className="px-1.5 py-0 border border-current rounded text-[7px] font-bold">{person.role || 'Staff'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center gap-8 text-right">
                     <div className="hidden xl:flex flex-col gap-0.5 items-end">
                        <span className="text-[9px] font-mono uppercase tracking-widest opacity-20">Last Active</span>
                        <span className="text-[9px] font-mono tracking-widest opacity-60">02:42 UTC</span>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDeleteMember(person._id)}
                          className={`p-2 rounded-full border transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                            isDark ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-red-500/10 text-red-500 hover:bg-red-50"
                          }`}
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link 
                          href={`#`}
                          className={`p-2 rounded-full border transition-all duration-300 ${
                            isDark ? "border-white/5 hover:border-white/20 hover:bg-white/5" : "border-black/5 hover:border-black/10 hover:bg-black/5"
                          }`}
                        >
                           <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                     </div>
                  </div>
               </motion.div>
             ))
           )}
        </div>
      </div>

      {/* Initialize Member Slide-over / Modal */}
      <AnimatePresence>
        {isAddingMember && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMember(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className={`fixed top-0 right-0 h-full w-full max-w-xl z-[70] p-12 overflow-y-auto ${
                isDark ? "bg-[#0a0a0a] border-l border-white/5" : "bg-white border-l border-black/5"
              }`}
            >
              <div className="flex items-center justify-between mb-16">
                 <button onClick={() => setIsAddingMember(false)} className="p-4 rounded-full border border-white/5 hover:bg-white/5 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                 </button>
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">System Protocol: Init_Record</span>
              </div>

              <div className="mb-16">
                <h2 className="font-serif text-4xl mb-6">Personnel <span className="italic">Initialization</span></h2>
                <p className="text-neutral-500 font-light text-sm leading-relaxed">
                  Enter the necessary cryptographic and operational data to establish a new property record.
                </p>
              </div>

              <form onSubmit={handleAddMember} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Identity Disclosure</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Legal Name" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className={`w-full bg-transparent border-b pb-4 text-2xl font-serif focus:outline-none focus:border-neutral-500 transition-all ${
                      isDark ? "border-white/10" : "border-black/10"
                    }`}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Communication Vector</label>
                  <input 
                    required
                    type="email" 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={`w-full bg-transparent border-b pb-4 text-xl font-light focus:outline-none focus:border-neutral-500 transition-all ${
                      isDark ? "border-white/10" : "border-black/10"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Departmental Anchor</label>
                      <select 
                        required
                        value={formData.departmentId}
                        onChange={e => setFormData({...formData, departmentId: e.target.value})}
                        className={`w-full bg-transparent border-b pb-4 text-sm font-light focus:outline-none focus:border-neutral-500 transition-all ${
                          isDark ? "border-white/10" : "border-black/10"
                        }`}
                      >
                         <option value="">Select Department...</option>
                         {departments.map(dept => (
                           <option key={dept._id} value={dept._id}>{dept.name}</option>
                         ))}
                      </select>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Operation Role</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Head Sommelier" 
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        className={`w-full bg-transparent border-b pb-4 text-sm font-light focus:outline-none focus:border-neutral-500 transition-all ${
                          isDark ? "border-white/10" : "border-black/10"
                        }`}
                      />
                   </div>
                </div>

                <div className="space-y-4 pt-6">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Cryptographic Credential (Optional)</label>
                   <input 
                     type="password" 
                     placeholder="Secure Password" 
                     value={formData.password}
                     onChange={e => setFormData({...formData, password: e.target.value})}
                     className={`w-full bg-transparent border-b pb-4 text-sm font-light focus:outline-none focus:border-neutral-500 transition-all ${
                       isDark ? "border-white/10" : "border-black/10"
                     }`}
                   />
                </div>

                <div className="space-y-4 pt-6">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Access Privilege Vector</label>
                   <div className="flex gap-4">
                      {['MEMBER', 'DEPARTMENT_HEAD', 'ADMIN'].map(role => (
                        <button 
                          key={role}
                          type="button"
                          onClick={() => setFormData({...formData, accessRole: role})}
                          className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest border transition-all duration-500 ${
                            formData.accessRole === role 
                              ? isDark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                              : isDark ? "border-white/10 text-white/40 hover:border-white/30" : "border-black/10 text-neutral-400 hover:border-black/30"
                          }`}
                        >
                           {role.replace('_', ' ')}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-12">
                   <button 
                     disabled={loading}
                     className={`w-full py-6 text-xs font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 ${
                       isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                     } disabled:opacity-20`}
                   >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit to Registry"}
                   </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sophisticated UI Notifications */}
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
