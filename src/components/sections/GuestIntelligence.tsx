"use client";

import { useEffect, useState } from "react";
import Section from "@/components/ui/Section";
import { useTheme } from "@/context/ThemeContext";
import { Loader2, Check } from "lucide-react";

interface GuestSegment {
  id: string;
  name: string;
  predictedSegment: string;
  totalSpend: number;
  loyaltyScore: number;
  aiChurnRisk?: number;
  topAmenityPredicted?: string;
}

export default function GuestIntelligence() {
  const { isDark } = useTheme();
  const [data, setData] = useState<GuestSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const handleTakeAction = async (guest: GuestSegment) => {
    setActioningId(guest.id);
    // Simulate AI offer generation and dispatch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCompletedActions(prev => new Set(prev).add(guest.id));
    setActioningId(null);
  };

  useEffect(() => {
    fetch("/api/analytics/guest-prediction")
      .then(res => res.json())
      .then(d => {
        if (Array.isArray(d)) {
            // Mock some extra fields for the demo if they don't exist
            const enriched = d.map(guest => ({
                ...guest,
                aiChurnRisk: guest.aiChurnRisk || Math.random() * 100,
                topAmenityPredicted: guest.topAmenityPredicted || ["Spa", "Dining", "Room Service", "Golf"][Math.floor(Math.random() * 4)]
            }));
            setData(enriched);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data.length) return null;

  return (
    <Section id="guest-intelligence" className="pb-24 bg-transparent mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-10 mb-20 md:mb-32 border-b border-neutral-100 dark:border-white/10 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 opacity-40">
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Guest Intelligence</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground tracking-tight">
              Behavioral <span className="italic text-neutral-400 dark:text-neutral-500">Inference</span>
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm md:text-base leading-relaxed font-light">
              Neural models predicting lifetime value, behavioral segment shifting, and real-time attrition risk across the high-net-worth portfolio.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-3 grayscale opacity-60">
            <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-bold">Neural Engine</span>
            <span className="text-[10px] text-foreground flex items-center gap-3 font-medium tracking-widest border border-current px-3 py-1">
              LIVE INFERENCE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-x-20 md:gap-y-32">
          {data.slice(0, 6).map((guest) => {
            return (
              <div 
                key={guest.id} 
                className="group border-b border-neutral-100 dark:border-white/5 pb-16 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-16">
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-[0.4em] font-bold mb-2">
                        {guest.predictedSegment}
                    </div>
                    <div className="font-serif text-3xl text-foreground tracking-tight font-light">{guest.name}</div>
                  </div>
                </div>

                <div className="space-y-12">
                    {/* Loyalty Score */}
                    <div>
                        <div className="flex justify-between items-baseline mb-4">
                            <span className="text-[9px] text-neutral-400 tracking-[0.3em] uppercase font-bold">Confidence Index</span>
                            <span className="font-mono text-[10px] text-foreground font-black">{Math.round(guest.loyaltyScore)}.00</span>
                        </div>
                        <div className="h-[1px] w-full bg-neutral-100 dark:bg-white/5">
                            <div 
                                className="h-full bg-foreground"
                                style={{ width: `${guest.loyaltyScore}%` }}
                            />
                        </div>
                    </div>
                    
                    {/* Churn Risk */}
                    <div>
                        <div className="flex justify-between items-baseline mb-4">
                            <span className="text-[9px] text-neutral-400 tracking-[0.3em] uppercase font-bold">Attrition Risk</span>
                            <span className="font-mono text-[10px] text-foreground font-black">{Math.round(guest.aiChurnRisk!)}%</span>
                        </div>
                        <div className="h-[1px] w-full bg-neutral-100 dark:bg-white/5">
                            <div 
                                className={`h-full ${guest.aiChurnRisk! > 50 ? "bg-rose-500" : "bg-neutral-300 dark:bg-white/30"}`}
                                style={{ width: `${guest.aiChurnRisk}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 pt-10 border-t border-neutral-100 dark:border-white/5">
                        <div>
                            <span className="block text-[9px] text-neutral-400 dark:text-neutral-500 tracking-[0.3em] uppercase mb-3 font-bold">Proj. LTV</span>
                            <span className="font-serif text-2xl text-foreground font-light tracking-tight">${guest.totalSpend.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-[9px] text-neutral-400 dark:text-neutral-500 tracking-[0.3em] uppercase mb-3 font-bold">Calibrated Ask</span>
                            <span className="font-sans text-[11px] text-foreground truncate block font-bold uppercase tracking-[0.1em]">{guest.topAmenityPredicted} Offer</span>
                        </div>
                    </div>

                    <div className="pt-12">
                        <button
                            onClick={() => handleTakeAction(guest)}
                            disabled={actioningId === guest.id || completedActions.has(guest.id)}
                            className={`w-full py-5 px-6 text-[10px] uppercase tracking-[0.4em] font-bold transition-all flex items-center justify-center gap-4 rounded-none h-16 ${
                                completedActions.has(guest.id)
                                    ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 cursor-default"
                                    : actioningId === guest.id
                                        ? "bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/10 text-neutral-400 cursor-wait"
                                        : "bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.99] border border-foreground"
                            }`}
                        >
                            {completedActions.has(guest.id) ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    DISPATCHED
                                </>
                            ) : actioningId === guest.id ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    STRATEGY...
                                </>
                            ) : (
                                <>OPTIMIZE YIELD</>
                            )}
                        </button>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
