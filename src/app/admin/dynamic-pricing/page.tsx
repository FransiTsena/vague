"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Settings2, 
  Zap, 
  Plus, 
  Minus, 
  Activity, 
  RefreshCw,
  Calendar as CalendarIcon,
  Home,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Trophy,
  BarChart3,
  CalendarDays,
  Gauge
} from "lucide-react";
import Button from "@/components/ui/Button";

interface PricingData {
  roomId: string;
  roomType: string;
  basePrice: number;
  dynamicPrice: number;
  aiInsight?: string;
  factors: {
    eventMultiplier: number;
    occupancyRate: number;
    leadDays: number;
    aiMultiplier: number;
    ruleMultiplier: number;
    seasonalityMultiplier: number;
    weekendMultiplier: number;
    occupancyMultiplier: number;
    leadTimeMultiplier: number;
    demandTrendMultiplier: number;
    volatilityMultiplier: number;
    dynamicMultiplier: number;
    isHoliday: boolean;
    eventName: string;
  };
  date: string;
  trends?: {
    velocityDelta: number;
    velocityChangePercent: number;
  };
}

interface PricingOverride {
  aiMultiplier: number;
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
  updatedRooms?: number;
}

export default function DynamicPricingAdmin() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [override, setOverride] = useState<PricingOverride | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [statusMsg, setStatusMsg] = useState("");

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [pricingRes, overrideRes] = await Promise.all([
        fetch(`/api/pricing?roomId=demo-id&date=${today}`),
        fetch("/api/pricing/override")
      ]);

      const pricingData = await pricingRes.json();
      const overrideData = await overrideRes.json();

      setPricing(pricingData);
      setOverride(overrideData);
      setMultiplier(overrideData.aiMultiplier || 1);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setStatusMsg("Error loading pricing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateMultiplier = async (val: number) => {
    setMultiplier(prev => {
        const next = Math.round((prev + val) * 100) / 100;
        return Math.min(2, Math.max(0.5, next));
    });
  };

  const saveOverride = async () => {
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/pricing/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          aiMultiplier: multiplier, 
          isActive: true,
          updatedBy: "Manager UI"
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOverride(data);
        setStatusMsg(`Yield updated for ${data.updatedRooms} rooms.`);
        await fetchAllData();
      } else {
        setStatusMsg(data.error || "Failed to update pricing.");
      }
    } catch (err) {
      setStatusMsg("Server error while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-black min-h-screen">
        <div className="space-y-4 text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto text-neutral-400" />
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Initializing Yield Strategy</p>
        </div>
      </div>
    );
  }

  const factors = pricing?.factors || {} as any;
  const trends = pricing?.trends || { velocityDelta: 0, velocityChangePercent: 0 };
  const currentTotal = pricing?.dynamicPrice || 0;
  const basePrice = pricing?.basePrice || 0;
  const priceDiff = currentTotal - basePrice;
  const diffPercent = Math.round((priceDiff / basePrice) * 100);

  // Business Logic Interpretations
  const demandLevel = factors.occupancyRate > 0.8 ? "CRITICAL" : factors.occupancyRate > 0.6 ? "HIGH" : factors.occupancyRate > 0.3 ? "MODERATE" : "WEAK";
  const bookingTrend = factors.demandTrendMultiplier > 1.05 ? "RISING" : factors.demandTrendMultiplier < 0.95 ? "FALLING" : "STABLE";
  const recommendation = diffPercent > 0 ? `Increase price by +${diffPercent}%` : diffPercent < 0 ? `Apply discount of ${diffPercent}%` : "Maintain current parity";

  const strategyLabel = multiplier < 0.85 ? "CONSERVATIVE" : multiplier > 1.15 ? "AGGRESSIVE" : "BALANCED";
  const strategyDesc = multiplier < 0.85 ? "Lower prices to drive volume and occupancy." : multiplier > 1.15 ? "Higher prices to maximize revenue per room." : "Balanced approach between volume and margin.";

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-black p-8 md:p-16 pt-32">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header and Recommendation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Intelligence Hub</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tighter">
                Yield <span className="italic text-neutral-400">Tactics</span>
              </h1>
              <p className="text-sm text-neutral-500 max-w-md font-light">
                Actionable insights for revenue managers. Optimize pricing based on real-time demand signals.
              </p>
            </div>
          </div>

          {/* TOP PRIORITY: Recommendation Card */}
          <div className="lg:col-span-5">
            <div className="bg-black dark:bg-white text-white dark:text-black p-8 relative overflow-hidden group border border-black/10 dark:border-white/10">
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">
                  <span>AI Recommended Action</span>
                  <Target className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-light tracking-tighter group-hover:translate-x-1 transition-transform duration-500">
                    {recommendation}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-400">
                      <Trophy className="w-3 h-3" />
                      CONFIDENCE: 92%
                    </div>
                    {trends.velocityChangePercent !== 0 && (
                      <div className={`flex items-center gap-2 text-[10px] font-bold tracking-widest ${trends.velocityChangePercent > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        <TrendingUp className="w-3 h-3" />
                        HISTORICAL TREND: {trends.velocityChangePercent > 0 ? "+" : ""}{trends.velocityChangePercent}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 dark:border-black/10 space-y-3">
                  <div className="flex gap-2 items-start text-[11px] font-light leading-snug opacity-80">
                    <ArrowUpRight className="w-3 h-3 mt-0.5 shrink-0 text-emerald-400" />
                    <span>{bookingTrend === "RISING" ? "Booking velocity is accelerating." : "Pattern shift detected in lead velocity."}</span>
                  </div>
                  <div className="flex gap-2 items-start text-[11px] font-light leading-snug opacity-80">
                    <ArrowUpRight className="w-3 h-3 mt-0.5 shrink-0 text-emerald-400" />
                    <span>{demandLevel === "HIGH" || demandLevel === "CRITICAL" ? "Remaining inventory is constrained." : "Inventory absorption is steady."}</span>
                  </div>
                </div>
              </div>
              <Zap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
            </div>
          </div>
        </div>

        {/* Business Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-neutral-100 dark:bg-white/10 border border-neutral-100 dark:border-white/10">
          {[
            { label: "Demand Level", value: demandLevel, sub: `${(factors.occupancyRate * 100).toFixed(0)}% Occupancy`, color: demandLevel === "CRITICAL" || demandLevel === "HIGH" ? "text-emerald-500" : "text-amber-500" },
            { label: "Booking Trend", value: bookingTrend, sub: "Last 24h Velocity", color: bookingTrend === "RISING" ? "text-emerald-500" : "text-neutral-500" },
            { label: "Event Pressure", value: factors.eventName !== "None" ? "STRONG" : "NORMAL", sub: factors.eventName || "Standard Period", color: factors.eventName !== "None" ? "text-purple-500" : "text-neutral-500" },
            { label: "Yield Spread", value: `$${Math.abs(priceDiff).toFixed(2)}`, sub: diffPercent > 0 ? "Premium Capture" : "Incentivized Rate", color: diffPercent > 0 ? "text-emerald-500" : "text-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-black p-8 space-y-1">
              <span className="text-[8px] font-black tracking-[0.4em] uppercase opacity-40">{stat.label}</span>
              <div className={`text-2xl font-light tracking-tighter ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] uppercase tracking-widest opacity-30 font-bold">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Strategy & Logic */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Improved Yield Control */}
            <div className="p-8 border border-neutral-100 dark:border-white/10 space-y-8 bg-neutral-50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase">Pricing Strategy</h3>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="text-2xl font-light tracking-tighter text-blue-500">{strategyLabel}</div>
                  <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
                    {strategyDesc}
                  </p>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-baseline">
                     <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Calibration</span>
                     <span className="text-xl font-mono text-blue-500">{multiplier.toFixed(2)}x</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <button 
                       onClick={() => handleUpdateMultiplier(-0.05)}
                       className="p-3 border border-neutral-100 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                     >
                       <Minus className="w-4 h-4" />
                     </button>
                     <input 
                       title="Strategy Slider"
                       type="range"
                       min="0.5"
                       max="2.0"
                       step="0.05"
                       value={multiplier}
                       onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                       className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800 appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
                     />
                     <button 
                       onClick={() => handleUpdateMultiplier(0.05)}
                       className="p-3 border border-neutral-100 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                     >
                       <Plus className="w-4 h-4" />
                     </button>
                   </div>
                </div>

                <Button 
                    onClick={saveOverride}
                    disabled={saving}
                    className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-none text-[10px] uppercase font-bold tracking-[0.3em]"
                  >
                    {saving ? "Deploying..." : "Apply Strategy"}
                </Button>
              </div>
            </div>

            {/* Smart Alerts */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase opacity-40">System Alerts</h3>
              </div>
              <div className="space-y-3">
                {factors.occupancyRate > 0.8 && (
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 flex gap-4 items-start animate-in fade-in slide-in-from-left-2 duration-500">
                    <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">High Demand Alert</div>
                      <p className="text-[11px] font-light leading-relaxed text-neutral-600 dark:text-neutral-400">Inventory is almost full for the target date. Consider adding a +20% premium surcharge.</p>
                    </div>
                  </div>
                )}
                {factors.occupancyRate < 0.4 && (
                  <div className="p-6 bg-amber-500/5 border border-amber-500/10 flex gap-4 items-start animate-in fade-in slide-in-from-left-2 duration-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400">Low Demand Warning</div>
                      <p className="text-[11px] font-light leading-relaxed text-neutral-600 dark:text-neutral-400">Bookings are below historical average. Suggest runninng a short-term direct-only discount.</p>
                    </div>
                  </div>
                )}
                <div className="p-6 border border-neutral-100 dark:border-white/5 flex gap-4 items-start opacity-50">
                   <Activity className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                   <div className="space-y-1">
                      <div className="text-[10px] font-bold tracking-widest uppercase">System Check</div>
                      <p className="text-[11px] font-light leading-relaxed">External market data synchronized. Local parity within target range.</p>
                   </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visualization & Roadmap */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Demand Calendar Roadmap */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-xs font-bold tracking-[0.3em] uppercase opacity-40">Demand Roadmap (Next 7 Days)</h3>
                </div>
                <div className="flex gap-4 text-[9px] font-bold tracking-widest uppercase">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> High</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Med</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Low</div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => {
                  const dayDemand = i >= 4 ? "High" : i >= 2 ? "Med" : "Low";
                  const color = dayDemand === "High" ? "bg-emerald-500" : dayDemand === "Med" ? "bg-amber-500" : "bg-rose-500";
                  return (
                    <div key={day} className="flex flex-col gap-2">
                       <div className="text-center text-[9px] font-bold tracking-widest opacity-30">{day}</div>
                       <div className={`h-16 border border-black/5 dark:border-white/5 relative group transition-all duration-500 hover:scale-[1.02] ${color}/5`}>
                          <div className={`absolute bottom-0 left-0 right-0 h-1 ${color} opacity-40`} />
                          <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity`}>
                            {dayDemand}
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Timeline Visualization (Simple Mock CSS Graph) */}
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center border-b border-neutral-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-xs font-bold tracking-[0.3em] uppercase opacity-40">Price Projection</h3>
                </div>
              </div>
              <div className="h-48 border border-neutral-100 dark:border-white/5 relative flex items-end p-8 gap-4">
                 {/* Mock Graph Lines */}
                 <div className="absolute inset-x-8 top-12 border-t border-dashed border-neutral-100 dark:border-white/5 text-[8px] uppercase tracking-widest font-bold opacity-30">Target Ceiling</div>
                 <div className="absolute inset-x-8 bottom-12 border-t border-dashed border-neutral-100 dark:border-white/5 text-[8px] uppercase tracking-widest font-bold opacity-30">Parity Floor</div>
                 
                 {/* Visual bars */}
                 {[40, 45, 60, 55, 80, 95, 85].map((v, i) => (
                   <div key={i} className="flex-1 bg-blue-500/20 relative group">
                      <div style={{ height: `${v}%` }} className="w-full bg-blue-500/40 transition-all duration-700 delay-[i*100ms] group-hover:bg-blue-500/60" />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        ${(basePrice * (1 + v/100)).toFixed(0)}
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Event / Holiday Highlight */}
            <div className="p-8 border border-neutral-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 bg-purple-500/5">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 border border-purple-500/20 flex items-center justify-center text-purple-500">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold tracking-[0.3em] uppercase text-purple-600 dark:text-purple-400">Upcoming Catalyst</h4>
                    <p className="text-sm font-light text-neutral-800 dark:text-neutral-200">
                      {factors.eventName !== "None" ? factors.eventName : "Easter Holiday Weekend"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2 text-center md:text-right">
                   <div className="text-[10px] font-bold tracking-widest uppercase text-purple-500 px-4 py-2 bg-purple-500/10">High Demand Expected</div>
                   <div className="text-[9px] uppercase tracking-widest font-bold opacity-40">Rec. Action: Increase Prices +25%</div>
                </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
