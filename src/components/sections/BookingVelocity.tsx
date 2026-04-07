"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { TrendingUp, ArrowUpRight, Clock, Target, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface VelocityStats {
  currentRate: number; // bookings/hr
  historicAvg: number;
  surgeStatus: "stable" | "elevated" | "surge";
  leadTimeAvg: number; // days
  conversionConfidence: number; // percentage
}

export default function BookingVelocity() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<VelocityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking the behavior for initial development
    setTimeout(() => {
      setStats({
        currentRate: 4.2,
        historicAvg: 2.8,
        surgeStatus: "elevated",
        leadTimeAvg: 18.5,
        conversionConfidence: 94.2
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center opacity-20">
        <Loader2 className="w-5 h-5 animate-spin mr-3" />
        <span className="font-mono text-[10px] uppercase tracking-[0.4em]">Analyzing Flow Metrics...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-y border-neutral-100 dark:border-white/5">
      {/* Velocity Metric */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 opacity-40">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Current Velocity</span>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="text-5xl font-serif font-light">{stats?.currentRate}</span>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-emerald-500 flex items-center gap-1">
              <ArrowUpRight className="w-2 h-2" /> +52%
            </span>
            <span className="text-[8px] opacity-40 uppercase font-mono tracking-tighter">vs 7d avg</span>
          </div>
        </div>
        <p className="text-[10px] text-neutral-500 font-light leading-relaxed">
          Unit influx exceeds seasonal baseline. System suggests dynamic price adjustment.
        </p>
      </div>

      {/* Surge Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 opacity-40">
          <Target className="w-3 h-3 text-sky-500" />
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Surge Probability</span>
        </div>
        <div className="relative h-12 flex items-center">
            <div className={`text-[10px] font-mono px-3 py-1 border uppercase tracking-widest ${
                stats?.surgeStatus === 'surge' ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                stats?.surgeStatus === 'elevated' ? 'bg-amber-500/10 border-amber-500 text-amber-500' :
                'bg-emerald-500/10 border-emerald-500 text-emerald-500'
            }`}>
                {stats?.surgeStatus} activity detected
            </div>
        </div>
        <p className="text-[10px] text-neutral-500 font-light leading-relaxed font-mono">
            HASH: {Math.random().toString(16).substring(2, 8).toUpperCase()}
        </p>
      </div>

      {/* Lead Time */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 opacity-40">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Avg Lead Horizon</span>
        </div>
        <div>
          <span className="text-3xl font-serif font-light">{stats?.leadTimeAvg} <span className="text-sm italic text-neutral-400">Days</span></span>
        </div>
        <div className="w-full h-[2px] bg-neutral-100 dark:bg-white/5 relative overflow-hidden">
            <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute inset-0 bg-current opacity-40"
            />
        </div>
      </div>

      {/* Conversion Confidence */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 opacity-40">
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase italic">Neural Confidence</span>
        </div>
        <div className="text-5xl font-serif font-light text-neutral-300 dark:text-neutral-700">
            {stats?.conversionConfidence}%
        </div>
        <p className="text-[8px] uppercase tracking-widest opacity-40 font-bold">
            Liquidity Prediction
        </p>
      </div>
    </div>
  );
}
