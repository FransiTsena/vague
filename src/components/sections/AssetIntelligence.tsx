"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Activity, ShieldAlert, TrendingDown, DollarSign, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface AssetStats {
  roomId: string;
  roomNumber: string;
  type: string;
  efficiency: number;
  status: string;
}

export default function AssetIntelligence({ rooms }: { rooms: any[] }) {
  const { isDark } = useTheme();
  
  // High-level metrics
  const avgUtilization = 11.3;
  const maintenanceAtRisk = 0;
  const portfolioValue = 83505956;
  const healthTrajectory = -0;

  return (
    <div className={`mb-16 p-8 border ${isDark ? "bg-black border-white/5" : "bg-neutral-50 border-black/5"}`}>
      {/* Header section matching the screenshot */}
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 opacity-40">
            <Activity className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-emerald-500/80">Asset Intelligence</span>
          </div>
          <h2 className="font-serif text-4xl font-light tracking-tight">
            Utilization <span className="italic text-neutral-400">& Health</span>
          </h2>
          <p className="text-neutral-500 max-w-xl text-[10px] uppercase tracking-widest leading-loose font-light">
            Predictive asset health mapping and algorithmic yield efficiency per inventory class.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="text-right">
            <div className="text-[8px] font-mono uppercase tracking-[0.3em] opacity-40 mb-2">Avg Utilization</div>
            <div className="text-3xl font-serif">{avgUtilization}%</div>
          </div>
          <div className="text-right">
            <div className="text-[8px] font-mono uppercase tracking-[0.3em] opacity-40 mb-2">Maintenance at Risk</div>
            <div className="text-3xl font-serif text-rose-500 flex items-center justify-end gap-2">
               <ShieldAlert className="w-4 h-4" /> {maintenanceAtRisk}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Room Grid Section */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {rooms.slice(0, 15).map((room, i) => (
            <motion.div 
              key={room._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 border ${isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-black/[0.01]"} relative overflow-hidden group`}
            >
              <div className="flex justify-between items-start mb-8 text-[8px] font-mono opacity-30 uppercase tracking-tighter">
                <span>{room.type?.substring(0, 3).toUpperCase() || 'STA'}</span>
              </div>
              
              <div className="text-3xl font-serif font-light mb-4 tracking-tighter transition-all group-hover:tracking-normal">
                {room.roomNumber}
              </div>
              
              <div className="space-y-1">
                <div className="h-[1px] w-full bg-current opacity-10 mb-2" />
                <div className="text-[7px] font-mono uppercase tracking-widest opacity-40">
                  Eff: {Math.floor(Math.random() * 25 + 5)}%
                </div>
              </div>

              {/* Status Indicator pulse */}
              <div className={`absolute top-0 right-0 w-1 h-1 m-2 rounded-full ${room.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'} opacity-20`} />
            </motion.div>
          ))}
        </div>

        {/* Sidebar stats matching the screenshot */}
        <div className="space-y-8">
           {/* Portfolio Value Card */}
           <div className={`p-8 border ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/5 bg-black/[0.02]"}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 rounded-full border border-emerald-500/50 flex items-center justify-center">
                  <DollarSign className="w-3 h-3 text-emerald-500" />
                </div>
                <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-emerald-500/80">Portfolio Value</span>
              </div>
              <div className="text-3xl font-serif mb-3 tracking-tighter">
                €{portfolioValue.toLocaleString()}
              </div>
              <p className="text-[7px] font-mono uppercase tracking-widest opacity-30 leading-relaxed">
                Rolling 30-day generated value across all available units
              </p>
           </div>

           {/* Health Trajectory Card */}
           <div className={`p-8 border ${isDark ? "border-white/10 bg-white/[0.01]" : "border-black/5 bg-black/[0.01]"}`}>
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="w-3 h-3 text-rose-500/50" />
                <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-rose-500/80">Health Trajectory</span>
              </div>
              <div className="text-3xl font-serif text-rose-500/80 mb-3 tracking-tighter">
                -{healthTrajectory}%
              </div>
              <p className="text-[7px] font-mono uppercase tracking-widest opacity-30 leading-relaxed">
                Predicted degradation shift next week based on unconstrained demand
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
