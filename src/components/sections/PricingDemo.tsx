"use client";

import { useState, useEffect } from "react";
import Section from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { TrendingUp, Calendar as CalendarIcon, Loader2, Database, SlidersHorizontal, Check, RefreshCcw, Info, BrainCircuit, Activity, Settings2, Save } from "lucide-react";
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
    guestPressureMultiplier: number;
    bookingChannelMultiplier: number;
    mealPlanMultiplier: number;
    loyaltyMultiplier: number;
    refundableMultiplier: number;
    leadTimeMultiplier: number;
    stayLengthMultiplier: number;
    demandTrendMultiplier: number;
    volatilityMultiplier: number;
    promoMultiplier: number;
    specialRequestMultiplier: number;
    dynamicMultiplier: number;
    volatilityRatio: number;
    isHoliday: boolean;
    eventName: string;
    currentTypeBookings: number;
    previousTypeBookings: number;
  };
  date: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export default function PricingDemo() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [managerOverride, setManagerOverride] = useState<number>(1);
  const [hasSavedOverride, setHasSavedOverride] = useState(false);
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPricing = async () => {
    setLoading(true);
    setHasSavedOverride(false);
    setIsOverrideMode(false);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/pricing?roomId=demo-id&date=${today}`);
      const data = await res.json();
      if (data.error && data.error.includes("Cast to ObjectId failed")) {
          setSeedMessage("Please seed the database first to see dynamic pricing.");
      } else {
          setPricing(data);
          setManagerOverride(data.factors.aiMultiplier || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage("");
    try {
      const res = await fetch("/api/seed", { 
          method: "POST",
          body: JSON.stringify({ roomCount: 5, guestCount: 10, bookingCount: 20, calendarCount: 30 })
      });
      const data = await res.json();
      setSeedMessage(data.message || data.error);
      const today = new Date().toISOString().split("T")[0];
      await fetchPricing(); 
    } catch (err) {
      setSeedMessage("Failed to seed database.");
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveOverride = async () => {
    setSaving(true);
    // Simulate API call to save manager override
    await new Promise(resolve => setTimeout(resolve, 800));
    setHasSavedOverride(true);
    setIsOverrideMode(false);
    setSaving(false);
  };

  const effectiveAiMultiplier = isOverrideMode || hasSavedOverride ? managerOverride : (pricing?.factors.aiMultiplier || 1);
  const dynamicMultiplier = pricing ? clamp(pricing.factors.ruleMultiplier * effectiveAiMultiplier, 0.65, 2.5) : 1;
  const currentDynamicPrice = pricing ? round2(pricing.basePrice * dynamicMultiplier) : 0;
  
  const priceDiff = pricing ? currentDynamicPrice - pricing.basePrice : 0;
  const isPriceUp = priceDiff > 0;

  return (
    <Section id="pricing-demo" className={`pb-12 ${isDark ? "bg-[#0a0a0a]" : "bg-neutral-50"}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-neutral-200 dark:border-neutral-800 pb-8 gap-8">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-neutral-900 dark:text-white tracking-wide">
              Revenue Yield Target
            </h2>
            <p className="text-neutral-500 max-w-lg text-sm leading-relaxed">
              Real-time algorithm yielding dynamic pricing bounds. Recommendations are calibrated on lead time velocity, real-time parity, and unconstrained demand.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button onClick={fetchPricing} className={`w-full text-xs tracking-widest uppercase transition-all ${loading ? "opacity-50" : ""} bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200`}>
              {loading ? "Calculating..." : "Query Engine"}
            </Button>
            <button onClick={handleSeed} className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors text-right">
              {seeding ? "Generating..." : "Seed Baseline Data"}
            </button>
          </div>
        </div>

        {seedMessage && (
          <div className="mb-12 p-4 text-xs tracking-widest font-mono uppercase text-center border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
            {seedMessage}
          </div>
        )}

        {pricing ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Column: Output & Controls */}
            <div className="lg:col-span-4 space-y-12">
              {/* Main Price Card */}
              <div className="space-y-6">
                <div className="flex justify-between items-baseline border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">Asset Target</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{pricing.roomType} Rate</div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-sm text-neutral-500">
                    <span>Base Parity</span> 
                    <span className="font-mono">${pricing.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400">Dynamic Yield</span>
                    <span className="font-serif text-5xl text-neutral-900 dark:text-white tracking-tight">${currentDynamicPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end pt-1">
                    <span className={`text-[10px] font-mono tracking-widest uppercase ${isPriceUp ? "text-neutral-400" : "text-neutral-500"}`}>
                      {isPriceUp ? "+ " : "- "}${Math.abs(priceDiff).toFixed(2)} {isPriceUp ? "Premium" : "Discount"}
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Engine Rationale</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 italic leading-relaxed pl-4 border-l border-neutral-200 dark:border-neutral-800">
                    &quot;{pricing.aiInsight || "Target demand aligns with historical booking pace. Stabilizing around parity."}&quot;
                  </div>
                </div>
              </div>

              {/* Manager Override Controls */}
              <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-8">
                <div className="flex justify-between items-end">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                    Revenue Control
                  </h3>
                  {hasSavedOverride && <span className="text-[10px] uppercase tracking-widest text-neutral-900 dark:text-white">Active</span>}
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-4 text-xs font-medium">
                      <span className="text-neutral-600 dark:text-neutral-400">Yield Multiplier Override</span>
                      <span className="font-mono text-neutral-900 dark:text-white">
                        {managerOverride.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      title="Override Multiplier"
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={managerOverride}
                      onChange={(e) => {
                        setManagerOverride(parseFloat(e.target.value));
                        setIsOverrideMode(true);
                        setHasSavedOverride(false);
                      }}
                      className="w-full h-[1px] bg-neutral-300 dark:bg-neutral-700 appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 mt-4 uppercase tracking-widest">
                      <span>Floor (0.5x)</span>
                      <span>Parity (1.0x)</span>
                      <span>Ceiling (2.0x)</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveOverride} 
                    disabled={saving || (!isOverrideMode && !hasSavedOverride)}
                    className={`w-full py-3 text-[10px] tracking-widest uppercase transition-all border ${hasSavedOverride ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white" : (isOverrideMode ? "bg-neutral-100 text-neutral-900 border-transparent dark:bg-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700" : "border-neutral-200 text-neutral-400 dark:border-neutral-800 cursor-not-allowed")}`}
                  >
                    {saving ? "Publishing..." : (hasSavedOverride ? "Yield Deployed" : "Publish Yield")}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Reasoning / Multipliers breakdown */}
            <div className="lg:col-span-8">
              <div className="flex justify-between items-baseline mb-12 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                  Matrix Decomposition
                </h3>
                <div className="text-[10px] tracking-widest uppercase text-neutral-400">
                    Base Matrix: <span className="font-mono text-neutral-900 dark:text-white">{pricing.factors.ruleMultiplier.toFixed(3)}x</span>
                </div>
              </div>

              <div className="flex flex-col">
                
                {/* Individual Factors List */}
                <div className="grid grid-cols-12 gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800/50 items-center">
                  <div className="col-span-4 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Constraint</div>
                  <div className="col-span-6 text-xs text-neutral-600 dark:text-neutral-400">Observation</div>
                  <div className="col-span-2 text-xs font-mono text-right text-neutral-900 dark:text-white">Factor</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-6 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Lead Time</div>
                  <div className="col-span-6 text-sm text-neutral-800 dark:text-neutral-200">{pricing.factors.leadDays} days to arrival</div>
                  <div className="col-span-2 text-sm font-mono text-right text-neutral-900 dark:text-white">{pricing.factors.leadTimeMultiplier.toFixed(2)}x</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-6 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Velocity Pace</div>
                  <div className="col-span-6 text-sm text-neutral-800 dark:text-neutral-200">Trajectory deviation vs 30-day unconstrained mean</div>
                  <div className="col-span-2 text-sm font-mono text-right text-neutral-900 dark:text-white">{pricing.factors.demandTrendMultiplier.toFixed(2)}x</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-6 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Seasonality</div>
                  <div className="col-span-6 text-sm text-neutral-800 dark:text-neutral-200">Curve profile over target stay dates</div>
                  <div className="col-span-2 text-sm font-mono text-right text-neutral-900 dark:text-white">{(pricing.factors.seasonalityMultiplier * pricing.factors.weekendMultiplier).toFixed(2)}x</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-6 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Event Flag</div>
                  <div className="col-span-6 text-sm text-neutral-800 dark:text-neutral-200">{pricing.factors.eventName || "Standard Parity"}</div>
                  <div className="col-span-2 text-sm font-mono text-right text-neutral-900 dark:text-white">{pricing.factors.eventMultiplier.toFixed(2)}x</div>
                </div>
                
                <div className="grid grid-cols-12 gap-4 py-6 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Market Sentiment</div>
                  <div className="col-span-6 text-sm text-neutral-800 dark:text-neutral-200">Inferred competitor elasticity variance</div>
                  <div className="col-span-2 text-sm font-mono text-right text-neutral-900 dark:text-white">{pricing.factors.volatilityMultiplier.toFixed(2)}x</div>
                </div>

              </div>
              
              <div className="mt-12">
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-loose text-justify w-full font-mono">
                  Engine Architecture: The deterministic ruleset computes a baseline matrix aggregating curve seasonality, unconstrained inventory pressure, and lead-time elasticity. Concurrently, data algorithms parse external market volatility and anomalous demand arrays over the target horizon to define the final coefficient trajectory. Output bounds are strictly clamped at 0.65x — 2.50x to ensure brand consistency.
                </p>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="text-sm text-neutral-400 dark:text-neutral-600 font-mono tracking-widest uppercase">
              {loading ? "Querying Data Model..." : "Select query engine to analyze parity targets."}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
