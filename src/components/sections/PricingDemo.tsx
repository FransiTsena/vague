"use client";

import { useState, useEffect } from "react";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { TrendingUp } from "lucide-react";

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

interface PricingOverride {
  aiMultiplier: number;
  isActive: boolean;
}

interface ServicePricingRow {
  service: string;
  basePrice: number;
  dynamicPrice: number;
  difference: number;
  differencePercent: number;
  dynamicMultiplier: number;
  occupancyRate: number;
}

interface ServicePricingResponse {
  date: string;
  aiMultiplier: number;
  minPriceFloorPercent: number;
  services: ServicePricingRow[];
}

interface PricingTrendPoint {
  date: string;
  dynamicPrice: number;
  occupancyRate: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export default function PricingDemo() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [servicePricing, setServicePricing] = useState<ServicePricingRow[]>([]);
  const [pricingTrend, setPricingTrend] = useState<PricingTrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [managerOverride, setManagerOverride] = useState<number>(1);
  const [savedOverride, setSavedOverride] = useState<number | null>(null);
  const [hasSavedOverride, setHasSavedOverride] = useState(false);
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const MIN_DYNAMIC_MULTIPLIER = 0.75;
  const MAX_DYNAMIC_MULTIPLIER = 2.5;

  const addDays = (date: Date, days: number) => {
    const clone = new Date(date);
    clone.setDate(clone.getDate() + days);
    return clone;
  };

  const toDateInput = (date: Date) => date.toISOString().split("T")[0];

  const applyOverrideState = (override: PricingOverride) => {
    if (override.isActive) {
      setSavedOverride(override.aiMultiplier);
      setManagerOverride(override.aiMultiplier);
      setHasSavedOverride(true);
      setIsOverrideMode(false);
      return;
    }

    setSavedOverride(null);
    setHasSavedOverride(false);
    setIsOverrideMode(false);
  };

  const fetchPricing = async () => {
    setLoading(true);
    setTrendLoading(true);
    setTrendError("");
    setSeedMessage("");
    try {
      const today = new Date().toISOString().split("T")[0];
      const [res, servicesRes, overrideRes] = await Promise.all([
        fetch(`/api/pricing?roomId=demo-id&date=${today}`),
        fetch(`/api/pricing/services?date=${today}`),
        fetch("/api/pricing/override"),
      ]);

      const data = await res.json();
      const servicesData = (await servicesRes.json()) as ServicePricingResponse;
      const overrideData = (await overrideRes.json()) as PricingOverride;

      if (data.error && data.error.includes("Cast to ObjectId failed")) {
        setSeedMessage("Please seed the database first to see dynamic pricing.");
      } else {
        setPricing(data);
        applyOverrideState(overrideData);
        if (!overrideData.isActive) {
          setManagerOverride(data.factors.aiMultiplier || 1);
        }
      }

      if (servicesData?.services?.length) {
        setServicePricing(servicesData.services);
      } else {
        setServicePricing([]);
      }

      const trendStart = new Date(today);
      const trendDates = [0, 1, 2].map((offset) => toDateInput(addDays(trendStart, offset)));
      const trendResponses = await Promise.all(
        trendDates.map((date) => fetch(`/api/pricing?roomId=demo-id&date=${date}`)),
      );

      const trendPayloads = await Promise.all(trendResponses.map((response) => response.json()));
      const normalizedTrend = trendPayloads
        .map((payload, index) => {
          if (!payload || payload.error || typeof payload.dynamicPrice !== "number") return null;
          return {
            date: trendDates[index],
            dynamicPrice: payload.dynamicPrice,
            occupancyRate: payload?.factors?.occupancyRate ?? 0,
          } as PricingTrendPoint;
        })
        .filter((point): point is PricingTrendPoint => point !== null);

      setPricingTrend(normalizedTrend);
      if (normalizedTrend.length === 0) {
        setTrendError("Unable to render 3-day trend right now.");
      }
    } catch (err) {
      console.error(err);
      setPricingTrend([]);
      setTrendError("Unable to load 3-day trend.");
    } finally {
      setLoading(false);
      setTrendLoading(false);
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
    try {
      const res = await fetch("/api/pricing/override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aiMultiplier: managerOverride, isActive: true }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setSeedMessage(data.error || "Failed to save manager override.");
        return;
      }

      setSavedOverride(data.aiMultiplier);
      setHasSavedOverride(true);
      setIsOverrideMode(false);
      await fetchPricing();
    } catch {
      setSeedMessage("Failed to save manager override.");
    } finally {
      setSaving(false);
    }
  };

  const effectiveAiMultiplier = isOverrideMode
    ? managerOverride
    : (savedOverride ?? pricing?.factors.aiMultiplier ?? 1);
  const dynamicMultiplier = pricing
    ? clamp(pricing.factors.ruleMultiplier * effectiveAiMultiplier, MIN_DYNAMIC_MULTIPLIER, MAX_DYNAMIC_MULTIPLIER)
    : 1;
  const currentDynamicPrice = pricing ? round2(pricing.basePrice * dynamicMultiplier) : 0;
  
  const priceDiff = pricing ? currentDynamicPrice - pricing.basePrice : 0;
  const isPriceUp = priceDiff > 0;

  useEffect(() => {
    void fetchPricing();
  }, []);

  return (
    <Section id="pricing-demo" className="py-0 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 md:mb-32 border-b border-neutral-100 dark:border-white/10 pb-12 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 opacity-40">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Yield Performance</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground tracking-tight">
              Revenue <span className="italic text-neutral-400 dark:text-neutral-500">Yield Engine</span>
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm md:text-base leading-relaxed font-light">
              Real-time synchronization of room rates and service pricing calibrated on lead time velocity, market parity, and unconstrained demand.
            </p>
          </div>
          <div className="flex flex-col gap-4 min-w-[240px]">
            <Button onClick={fetchPricing} className={`w-full text-[10px] tracking-[0.3em] font-medium uppercase transition-all ${loading ? "opacity-50" : ""} bg-foreground text-background hover:opacity-90 rounded-none h-14 border border-foreground`}>
              {loading ? "Calculating..." : "Query Intelligence"}
            </Button>
            <button onClick={handleSeed} className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 hover:text-foreground transition-colors text-right font-medium">
              {seeding ? "Generating..." : "Baseline Resync"}
            </button>
          </div>
        </div>

        {seedMessage && (
          <div className="mb-12 p-4 text-[10px] tracking-[0.2em] font-mono uppercase text-center border-b border-neutral-100 dark:border-neutral-800 text-neutral-500">
            {seedMessage}
          </div>
        )}

        {pricing ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32">
            
            {/* Left Column: Output & Controls */}
            <div className="lg:col-span-4 space-y-16">
              {/* Main Price Card */}
              <div className="space-y-10">
                <div className="flex justify-between items-baseline border-b border-neutral-100 dark:border-white/5 pb-4">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-500 font-bold">Yield Target</div>
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">{pricing.roomType} Allocation</div>
                </div>

                <div className="flex flex-col space-y-6">
                  <div className="flex justify-between items-center text-xs text-neutral-400 dark:text-neutral-500">
                    <span className="font-light tracking-widest uppercase text-[10px]">Base Parity</span> 
                    <span className="font-mono text-foreground">${pricing.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-6">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500 dark:text-neutral-400 mb-3">Neural Rate</span>
                    <span className="font-serif text-6xl md:text-7xl text-foreground tracking-tighter leading-none">${currentDynamicPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-mono tracking-[0.2em] uppercase px-4 py-2 border ${isPriceUp ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "border-neutral-100 dark:border-white/10 text-neutral-400"} font-bold`}>
                      {isPriceUp ? "+ " : "- "}${Math.abs(priceDiff).toFixed(2)} {isPriceUp ? "PREMIUM" : "DISCOUNT"}
                    </span>
                  </div>
                </div>

                <div className="pt-10">
                  <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 dark:text-neutral-500 mb-6">Engine Rationale</div>
                  <div className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 italic font-light leading-relaxed pl-8 border-l border-neutral-100 dark:border-white/10">
                    &quot;{pricing.aiInsight || "Target demand aligns with historical booking pace. Stabilizing around parity."}&quot;
                  </div>
                </div>

                <div className="pt-12 border-t border-neutral-100 dark:border-white/5">
                  <div className="flex justify-between items-end mb-8">
                    <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400 dark:text-neutral-500">
                      Service Deltas
                    </h4>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 opacity-40">Floor: -25%</span>
                  </div>
                  <div className="space-y-4">
                    {servicePricing.map((service) => {
                      const isUp = service.difference >= 0;
                      const label = `${service.service.charAt(0).toUpperCase()}${service.service.slice(1)}`;
                      return (
                        <div key={service.service} className="grid grid-cols-12 gap-2 items-center text-[10px] border-b border-neutral-100 dark:border-white/5 pb-3">
                          <span className="col-span-4 uppercase tracking-[0.2em] text-neutral-500 font-bold">{label}</span>
                          <span className="col-span-4 font-mono text-neutral-400 tracking-tight">${service.basePrice.toFixed(2)}</span>
                          <span className="col-span-4 font-mono text-right flex items-center justify-end gap-3">
                            <span className="text-foreground font-black">${service.dynamicPrice.toFixed(2)}</span>
                            <span className={`${isUp ? "text-emerald-500" : "text-amber-500"} text-[8px] font-black`}>
                              {isUp ? "▲" : "▼"}{service.differencePercent.toFixed(1)}%
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-end justify-between mb-5">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-neutral-400 dark:text-neutral-500">
                      3-Day Trendline
                    </h4>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">AI + Occupancy</span>
                  </div>

                  {trendLoading ? (
                    <p className="text-xs text-neutral-500">Projecting next 3 days...</p>
                  ) : trendError ? (
                    <p className="text-xs text-rose-400 uppercase tracking-widest">{trendError}</p>
                  ) : (
                    <div className="space-y-3">
                      {pricingTrend.map((point, index) => {
                        const prev = index > 0 ? pricingTrend[index - 1] : null;
                        const delta = prev ? round2(point.dynamicPrice - prev.dynamicPrice) : 0;
                        const deltaPercent = prev && prev.dynamicPrice > 0
                          ? round2((delta / prev.dynamicPrice) * 100)
                          : 0;
                        const directionClass =
                          !prev || delta === 0
                            ? "text-neutral-500"
                            : delta > 0
                              ? "text-emerald-500"
                              : "text-amber-500";

                        return (
                          <div key={point.date} className="grid grid-cols-12 gap-2 items-center text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2">
                            <span className="col-span-4 uppercase tracking-wide text-neutral-500">
                              {new Date(point.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                            </span>
                            <span className="col-span-4 font-mono text-neutral-500">
                              Occ {(point.occupancyRate * 100).toFixed(0)}%
                            </span>
                            <span className="col-span-4 font-mono text-right">
                              <span className="text-foreground">${point.dynamicPrice.toFixed(2)}</span>
                              {prev && (
                                <span className={`ml-2 ${directionClass}`}>
                                  {delta > 0 ? "+" : ""}{deltaPercent.toFixed(1)}%
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Manager Override Controls */}
              <div className="pt-12 border-t border-neutral-100 dark:border-neutral-800 space-y-10">
                <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-neutral-400 dark:text-neutral-500">
                    Revenue Control
                  </h3>
                  {hasSavedOverride && <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-500">Live</span>}
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-6 text-[10px] tracking-widest uppercase font-bold text-foreground">
                      <span>Yield Multiplier Override</span>
                      <span className="font-mono">
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
                      className="w-full h-[1px] bg-neutral-200 dark:bg-neutral-700 appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:ring-4 [&::-webkit-slider-thumb]:ring-background"
                    />
                    <div className="flex justify-between text-[9px] text-neutral-400 dark:text-neutral-400 mt-6 font-mono uppercase tracking-widest">
                      <span>Floor</span>
                      <span>Parity</span>
                      <span>Ceiling</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveOverride} 
                    disabled={saving || !isOverrideMode}
                    className={`w-full py-4 text-[10px] tracking-[0.2em] font-bold uppercase transition-all border ${hasSavedOverride ? "bg-foreground text-background border-transparent" : (isOverrideMode ? "bg-foreground text-background border-transparent hover:opacity-90 shadow-xl" : "border-neutral-100 dark:border-neutral-800 text-neutral-400 cursor-not-allowed")}`}
                  >
                    {saving ? "Publishing..." : (isOverrideMode ? "Publish Yield Matrix" : "Yield Committed")}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Reasoning / Multipliers breakdown */}
            <div className="lg:col-span-8">
              <div className="flex justify-between items-baseline mb-12 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-neutral-400 dark:text-neutral-500">
                  Matrix Decomposition
                </h3>
                <div className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                    Matrix Base: <span className="font-mono text-foreground font-bold">{pricing.factors.ruleMultiplier.toFixed(3)}x</span>
                </div>
              </div>

              <div className="flex flex-col">
                
                {/* Individual Factors List */}
                <div className="grid grid-cols-12 gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800/50 items-center">
                  <div className="col-span-4 text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">Constraint</div>
                  <div className="col-span-6 text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">Observation</div>
                  <div className="col-span-2 text-[10px] font-bold text-right text-neutral-400 tracking-[0.2em] uppercase">Factor</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-8 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">Lead Time</div>
                  <div className="col-span-6 text-sm text-foreground font-light tracking-wide">{pricing.factors.leadDays} days to arrival</div>
                  <div className="col-span-2 text-sm font-mono text-right text-foreground font-bold">{pricing.factors.leadTimeMultiplier.toFixed(2)}x</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-8 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">Velocity Pace</div>
                  <div className="col-span-6 text-sm text-foreground font-light tracking-wide">Trajectory deviation vs unconstrained mean</div>
                  <div className="col-span-2 text-sm font-mono text-right text-foreground font-bold">{pricing.factors.demandTrendMultiplier.toFixed(2)}x</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-8 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">Seasonality</div>
                  <div className="col-span-6 text-sm text-foreground font-light tracking-wide">Historical curve profile mapping</div>
                  <div className="col-span-2 text-sm font-mono text-right text-foreground font-bold">{(pricing.factors.seasonalityMultiplier * pricing.factors.weekendMultiplier).toFixed(2)}x</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-8 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">Event Flag</div>
                  <div className="col-span-6 text-sm text-foreground font-light tracking-wide truncate">{pricing.factors.eventName || "Standard Parity"}</div>
                  <div className="col-span-2 text-sm font-mono text-right text-foreground font-bold">{pricing.factors.eventMultiplier.toFixed(2)}x</div>
                </div>
                
                <div className="grid grid-cols-12 gap-4 py-8 border-b border-neutral-100 dark:border-neutral-800/50 group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="col-span-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">Market Sentiment</div>
                  <div className="col-span-6 text-sm text-foreground font-light tracking-wide">Competitor elasticity variance</div>
                  <div className="col-span-2 text-sm font-mono text-right text-foreground font-bold">{pricing.factors.volatilityMultiplier.toFixed(2)}x</div>
                </div>

              </div>
              
              <div className="mt-16">
                <p className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] leading-relaxed w-full font-mono font-light text-center border border-neutral-100 dark:border-neutral-800 p-6 italic">
                  Deterministic ruleset aggregates seasonality & inventory pressure. Market algorithms parse volatility over target horizon.
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
