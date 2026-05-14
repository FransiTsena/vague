"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { TrendingUp, ArrowUpRight, Clock, Target, Loader2, Sparkles, AlertCircle, Share2, MousePointer2, Check, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VelocityStats {
  currentRate: number; // bookings/hr
  historicAvg: number;
  surgeStatus: "stable" | "elevated" | "surge";
  leadTimeAvg: number; // days
  conversionConfidence: number; // percentage
  aiInsights: {
    label: string;
    details: string;
    severity: "info" | "warning" | "optimized";
  }[];
  activeChannels: {
    name: string;
    percentage: number;
  }[];
}

export default function BookingVelocity() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<VelocityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleAiOverride = async () => {
    setIsSyncing(true);
    try {
      // 1. Sync Pricing Control (Dynamic Rate Hike)
      await fetch("/api/admin/pricing-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiMultiplier: 1.12, isActive: true })
      });

      // 2. Simulate Channel Enforcement & Yield Locking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsApplied(true);
      setTimeout(() => setIsApplied(false), 3000);
    } catch (err) {
      console.error("AI Override failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Mocking enhanced AI metrics
    const timer = setTimeout(() => {
      setStats({
        currentRate: 4.8,
        historicAvg: 2.8,
        surgeStatus: "surge",
        leadTimeAvg: 12.4,
        conversionConfidence: 96.8,
        aiInsights: [
          { label: "Channel Leakage", details: "OTA rates are 4% below direct web price. Adjust parity immediately.", severity: "warning" },
          { label: "Booking Pattern", details: "72% of new bookings are for Executive Suites. High yield demand.", severity: "info" },
          { label: "Optimal Pace", details: "Current velocity is 1.4x historic baseline. Suggesting +12% price hike.", severity: "optimized" }
        ],
        activeChannels: [
          { name: "Direct", percentage: 42 },
          { name: "OTA", percentage: 38 },
          { name: "GDS", percentage: 20 }
        ]
      });
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!stats) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stats.aiInsights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [stats]);

  if (loading) {
    return (
      <div className="h-80 flex flex-col items-center justify-center opacity-20">
        <Loader2 className="w-6 h-6 animate-spin mb-4" />
        <span className="font-mono text-[10px] uppercase tracking-[0.5em]">Neural Ledger Analysis In Progress...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-12 border-y border-neutral-100 dark:border-white/5">
      {/* Header Section matching screenshot style */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 opacity-40 text-sky-500">
            <Activity className="w-3 h-3" />
            <span className="text-[9px] font-bold tracking-[0.4em] uppercase">Reservation Intelligence</span>
          </div>
          <h2 className="font-serif text-4xl font-light tracking-tight">
            Flow <span className="italic text-neutral-400">& Velocity</span>
          </h2>
          <p className="text-neutral-500 max-w-xl text-[10px] uppercase tracking-widest leading-loose font-light">
            Algorithmic monitoring of booking trajectories, channel density, and neural conversion confidence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Velocity Metric */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 opacity-40">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Flow Velocity</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-serif font-light tracking-tighter">{stats?.currentRate}</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-bold">
                <ArrowUpRight className="w-3 h-3" /> +71.4%
              </span>
              <span className="text-[8px] opacity-40 uppercase font-mono tracking-widest whitespace-nowrap">vs control</span>
            </div>
          </div>
          <div className="h-1 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "71.4%" }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>

        {/* Channel Mix */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 opacity-40">
            <Share2 className="w-3 h-3 text-sky-500" />
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Inbound Sources</span>
          </div>
          <div className="space-y-3">
            {stats?.activeChannels.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between group">
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{channel.name}</span>
                <div className="flex items-center gap-3 w-1/2">
                   <div className="h-[2px] flex-1 bg-neutral-100 dark:bg-white/5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${channel.percentage}%` }}
                        className="h-full bg-sky-500/50"
                      />
                   </div>
                   <span className="text-[9px] font-mono font-bold leading-none">{channel.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Horizon */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 opacity-40">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Lead Precision</span>
          </div>
          <div>
            <div className="text-4xl font-serif font-light mb-2">{stats?.leadTimeAvg} <span className="text-xs italic text-neutral-400">Days Out</span></div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">
                Pace Shift: <span className="text-rose-500">-2.4d</span>
            </div>
          </div>
          <p className="text-[9px] leading-relaxed text-neutral-500 font-light italic">
             Shortening window indicates high impromptu demand for transient blocks.
          </p>
        </div>

        {/* AI Insight Pulse */}
        <div className="space-y-6 relative border-l border-neutral-100 dark:border-white/5 pl-8">
           <div className="flex items-center gap-3">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-amber-500/80">Neural Intelligence</span>
          </div>
          
          <div className="h-24 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                   <div className={`w-1 h-1 rounded-full ${
                     stats?.aiInsights[activeIndex].severity === 'warning' ? 'bg-rose-500' :
                     stats?.aiInsights[activeIndex].severity === 'optimized' ? 'bg-emerald-500' : 'bg-sky-500'
                   }`} />
                   <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                    {stats?.aiInsights[activeIndex].label}
                   </span>
                </div>
                <p className={`text-xs md:text-sm font-serif leading-relaxed italic ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}>
                  "{stats?.aiInsights[activeIndex].details}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-1 mt-4">
             {stats?.aiInsights.map((_, i) => (
               <div key={i} className={`h-[1px] flex-1 transition-all duration-500 ${i === activeIndex ? "bg-amber-500" : "bg-neutral-100 dark:bg-white/5"}`} />
             ))}
          </div>
        </div>
      </div>

      {/* Surge Visualization */}
      <div className={`p-6 border flex flex-col md:flex-row items-center justify-between gap-8 ${
        stats?.surgeStatus === 'surge' ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-neutral-100 dark:border-white/5'
      }`}>
         <div className="flex items-center gap-6">
            <div className="relative">
               <div className="w-12 h-12 rounded-full border border-current opacity-10" />
               <Target className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 ${
                 stats?.surgeStatus === 'surge' ? 'text-amber-500 animate-pulse' : 'opacity-20'
               }`} />
            </div>
            <div>
               <div className="text-[10px] font-mono uppercase tracking-[0.3em] mb-1">Demand Density Status</div>
               <div className={`text-xl font-serif italic ${stats?.surgeStatus === 'surge' ? 'text-amber-500' : 'opacity-40'}`}>
                  {stats?.surgeStatus === 'surge' ? 'Critical Surge Threshold Reached' : 'Stable Flow Parameters'}
               </div>
            </div>
         </div>

         <div className="flex gap-12 text-right">
            <div>
               <div className="text-[8px] font-mono uppercase opacity-40 mb-1">Conversion Confidence</div>
               <div className="text-2xl font-serif">{stats?.conversionConfidence}%</div>
            </div>
            <button 
              onClick={handleAiOverride}
              disabled={isSyncing || isApplied}
              className={`px-6 py-2 border flex items-center gap-3 text-[9px] font-mono tracking-[0.2em] transition-all relative ${
              isApplied ? "bg-emerald-500 border-emerald-500 text-white" :
              isSyncing ? "opacity-50 cursor-wait" :
              isDark ? "border-white hover:bg-white hover:text-black" : "border-black hover:bg-black hover:text-white"
            }`}>
               {isSyncing ? (
                 <Loader2 className="w-3 h-3 animate-spin" />
               ) : isApplied ? (
                 <Check className="w-3 h-3" />
               ) : (
                 <MousePointer2 className="w-3 h-3" />
               )}
               {isSyncing ? "SYNCING..." : isApplied ? "NEURAL SYNC COMPLETE" : "APPLY AI OVERRIDE"}
            </button>
         </div>
      </div>
    </div>
  );
}
