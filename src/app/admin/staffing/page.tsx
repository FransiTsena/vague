"use client";

import { useEffect, useState } from "react";
import { StaffingCalendar, CalendarItem } from "@/components/StaffingCalendar";
import Button from "@/components/ui/Button";
import { Loader2, Brain, AlertTriangle, CheckCircle2 } from "lucide-react";

const PriorityBadge = ({ level }: { level: string }) => {
  const isHigh = level.toLowerCase() === "high";
  const isMedium = level.toLowerCase() === "medium";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
      isHigh ? "bg-red-500/20 text-red-400 border border-red-500/30" : 
      isMedium ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : 
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
    }`}>
      {level} RISK
    </span>
  );
};

export default function StaffingAdminPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");

  const handleAiForecast = async () => {
    if (!selectedDept) {
        alert("Please select a department first");
        return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/staffing/ai-predict", {
        method: "POST",
        body: JSON.stringify({ departmentId: selectedDept, date: new Date().toISOString() })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const [eRes, dRes] = await Promise.all([
          fetch("/api/admin/staffing/events"),
          fetch("/api/admin/staffing/departments")
        ]);
        const [evts, depts] = await Promise.all([eRes.json(), dRes.json()]);
        setItems(evts || []);
        setDepartments(depts || []);
        if (depts?.length) setSelectedDept(depts[0]._id);
      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
    </div>
  );

  return (
    <div className="py-8 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-900 dark:bg-zinc-800/50 p-8 rounded-[2rem] border border-zinc-700/50 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-700/10 blur-3xl -mr-16 -mt-16 group-hover:bg-zinc-600/20 transition-all duration-700" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-playfair tracking-tight">Workforce Intelligence Engine</h1>
          <p className="text-zinc-400 mt-2 max-w-lg text-sm leading-relaxed">Cross-referencing live booking occupancy with department rosters using Llama-3 neural analysis.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 relative z-10 w-full md:w-auto">
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-6 py-3 bg-zinc-800 border-zinc-700 text-white rounded-full text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
          >
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <button 
            onClick={handleAiForecast}
            disabled={aiLoading}
            className="px-8 py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-full transition-all flex items-center gap-3 text-xs uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            Generate AI Forecast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: AI Context Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">Demand Analysis</h2>
            
            {aiResult ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Occupancy</p>
                    <p className="text-2xl font-bold font-playfair">{aiResult.occupancyAtTime}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Suggested</p>
                    <p className="text-2xl font-bold font-playfair">{aiResult.suggestedStaffCount}</p>
                  </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Status</p>
                        <PriorityBadge level={aiResult.riskLevel} />
                    </div>
                  {aiResult.isUnderstaffed ? (
                    <div className="flex items-start gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Action Required</p>
                        <p className="text-[11px] text-red-400/80 leading-relaxed mt-1">Found gap of {aiResult.suggestedStaffCount - aiResult.currentStaff} staff members for the current occupancy.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Optimized</p>
                        <p className="text-[11px] text-emerald-400/80 leading-relaxed mt-1">Staffing levels match luxury service protocols for current guest volume.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 leading-none">AI Reasoning</p>
                  <p className="text-sm font-light leading-relaxed italic text-zinc-600 dark:text-zinc-400 font-serif">
                    "{aiResult.reasoning}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto opacity-50">
                  <Brain className="w-8 h-8 text-zinc-300" />
                </div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Run analysis to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Master Schedule (Calendar) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
             <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 leading-none">Property Schedule</h2>
             <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-zinc-200" />
             </div>
          </div>
          <StaffingCalendar items={items} />
        </div>
      </div>
    </div>
  );
}
          fetch("/api/admin/staffing/departments")
        ]);
        
        if (eRes.ok) {
          const data = await eRes.json();
          setItems(data.map((d: any) => ({
            start: d.startsAt,
            end: d.endsAt,
            title: d.title,
            subtitle: d.departmentId?.name,
          })));
        }
        
        if (dRes.ok) {
          const depts = await dRes.json();
          setDepartments(depts);
          if (depts.length > 0) setSelectedDept(depts[0]._id);
        }
      } catch (error) {
        console.error("Initialization Failed", error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const runAiOptimization = async () => {
    if (!selectedDept) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/admin/staffing/ai-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          departmentId: selectedDept, 
          date: new Date().toISOString() 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      }
    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
           <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Workforce Intelligence</h1>
           <p className="text-zinc-500 mt-2 text-lg">Predictive staffing and automated roster optimization.</p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
           <select 
             className="bg-transparent text-sm font-medium border-none focus:ring-0 p-2 min-w-[200px]"
             value={selectedDept}
             onChange={(e) => setSelectedDept(e.target.value)}
           >
             {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
           </select>
           <Button 
             variant="primary" 
             onClick={runAiOptimization} 
             disabled={aiLoading}
             className="px-6 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/20"
           >
             {aiLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Brain className="h-4 w-4" />}
             {aiLoading ? "Analyzing..." : "AI Optimize"}
           </Button>
        </div>
      </div>

      {aiResult && (
        <div className={`mb-10 p-6 rounded-[2rem] border-2 flex flex-col md:flex-row gap-6 items-start transition-all shadow-xl animate-in fade-in zoom-in-95 duration-500 ${
          aiResult.isUnderstaffed 
            ? "bg-amber-50/50 border-amber-200/50 dark:bg-amber-950/10 dark:border-amber-800/50 shadow-amber-500/5"
            : "bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/10 dark:border-emerald-800/50 shadow-emerald-500/5"
        }`}>
           <div className={`p-4 rounded-2xl ${aiResult.isUnderstaffed ? "bg-amber-100 dark:bg-amber-900/40" : "bg-emerald-100 dark:bg-emerald-900/40"}`}>
             {aiResult.isUnderstaffed ? <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" /> : <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
           </div>
           <div className="flex-1">
             <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {aiResult.riskLevel.toUpperCase()} RISK: {aiResult.isUnderstaffed ? "Personnel Deficit" : "Operational Balance"}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${aiResult.isUnderstaffed ? "bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100" : "bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100"}`}>
                    AI Predicted
                </span>
             </div>
             <p className="text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed font-medium">
               {aiResult.reasoning}
             </p>
             <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Occupancy</span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{aiResult.occupancyAtTime}</div>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Suggested Staff</span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{aiResult.suggestedStaffCount}</div>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">On-Duty</span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{aiResult.currentStaff}</div>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Status</span>
                    <div className={`text-lg font-bold ${aiResult.isUnderstaffed ? "text-amber-600" : "text-emerald-600"}`}>
                        {aiResult.isUnderstaffed ? "RE-ROSTER" : "HEALTHY"}
                    </div>
                </div>
             </div>
           </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-4">
           <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
           <span className="text-zinc-400 font-medium animate-pulse">Syncing luxury rosters...</span>
        </div>
      ) : (
        <div className="shadow-2xl rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <StaffingCalendar items={items} />
        </div>
      )}
    </div>
  );
}
