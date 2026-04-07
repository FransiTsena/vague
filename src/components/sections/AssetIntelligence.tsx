"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Activity, ShieldAlert, TrendingDown, DollarSign, Zap, Sparkles, AlertCircle, Wrench, CheckCircle2, LayoutPanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AssetStats {
  roomId: string;
  roomNumber: string;
  type: string;
  efficiency: number;
  status: string;
  health: number;
}

const DEPLOYMENT_FEED = [
  { id: 1, unit: "104", type: "MAINTENANCE", message: "HVAC Duty Cycle exceeded. Predict 82% failure risk.", action: "Queue Inspection", severity: "high" },
  { id: 2, unit: "112", type: "OPTIMIZATION", message: "Low occupancy predicted. Target for complimentary LUX upgrade path.", action: "Approve Yield Shift", severity: "medium" },
  { id: 3, unit: "201", type: "ENERGY", message: "Neural load suggests vampire draw in Suite 201. Inspect smart grid.", action: "Deploy Field Tech", severity: "low" }
];

export default function AssetIntelligence({ rooms }: { rooms: any[] }) {
  const { isDark } = useTheme();
  const [activeInsight, setActiveInsight] = useState(0);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveInsight((prev) => (prev + 1) % DEPLOYMENT_FEED.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleExecute = async (id: number) => {
    setIsProcessing(id);
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(null);
  };
  
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
                <div className="flex justify-between items-center group/meta">
                   <div className="text-[7px] font-mono uppercase tracking-widest opacity-40">
                     Eff: {Math.floor(Math.random() * 25 + 5)}%
                   </div>
                   {i % 4 === 0 && (
                     <motion.div 
                       animate={{ opacity: [0.2, 0.5, 0.2] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       title="Neural Degradation Risk"
                     >
                        <AlertCircle className="w-2 h-2 text-rose-500" />
                     </motion.div>
                   )}
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

           {/* AI Deployment Queue - NEW Section */}
           <div className={`p-8 border border-emerald-500/10 min-h-[280px] flex flex-col justify-between ${isDark ? "bg-emerald-500/[0.02]" : "bg-emerald-500/[0.01]"}`}>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-emerald-500/80 italic">Neural Deployment</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInsight}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-serif font-light">{DEPLOYMENT_FEED[activeInsight].unit}</span>
                      <span className={`text-[8px] font-mono border px-2 py-0.5 rounded uppercase ${
                        DEPLOYMENT_FEED[activeInsight].severity === 'high' ? 'border-rose-500/50 text-rose-500' :
                        DEPLOYMENT_FEED[activeInsight].severity === 'medium' ? 'border-amber-500/50 text-amber-500' :
                        'border-sky-500/50 text-sky-500'
                      }`}>
                        {DEPLOYMENT_FEED[activeInsight].type}
                      </span>
                    </div>
                    <p className="text-[10px] uppercase font-mono tracking-widest leading-loose opacity-60">
                       {DEPLOYMENT_FEED[activeInsight].message}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                 <div className="flex gap-1">
                    {DEPLOYMENT_FEED.map((_, i) => (
                      <div key={i} className={`h-[1px] flex-1 transition-all duration-700 ${i === activeInsight ? "bg-current" : "bg-current/10"}`} />
                    ))}
                 </div>
                 <button 
                  onClick={() => handleExecute(DEPLOYMENT_FEED[activeInsight].id)}
                  disabled={isProcessing !== null}
                  className={`w-full py-4 border text-[9px] font-mono uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3 ${
                    isProcessing === DEPLOYMENT_FEED[activeInsight].id ? "opacity-50 cursor-wait bg-current text-white dark:text-black" :
                    isDark ? "border-white hover:bg-white hover:text-black" : "border-black hover:bg-black hover:text-white"
                   }`}
                 >
                    {isProcessing === DEPLOYMENT_FEED[activeInsight].id ? (
                      <Activity className="w-3 h-3 animate-spin" />
                    ) : (
                      <LayoutPanelLeft className="w-3 h-3" />
                    )}
                    {isProcessing === DEPLOYMENT_FEED[activeInsight].id ? "Synchronizing Asset..." : DEPLOYMENT_FEED[activeInsight].action}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
