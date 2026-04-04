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
    <Section id="guest-intelligence" className="pb-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-3 mb-20 border-b border-neutral-200 dark:border-neutral-800 pb-12">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-foreground tracking-tight">
              Guest Intelligence
            </h2>
            <p className="text-neutral-500 max-w-lg text-sm leading-relaxed font-light">
              Proprietary models predicting lifetime value, behavioral segment shifting, and churn probability in real-time.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-bold">Inference Engine</span>
            <span className="text-xs font-mono text-foreground flex items-center gap-2 font-bold tracking-widest">
              <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> LIVE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {data.slice(0, 6).map((guest) => {
            return (
              <div 
                key={guest.id} 
                className="group border-b border-neutral-100 dark:border-neutral-800 pb-12 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-12">
                  <div className="flex flex-col gap-1">
                    <div className="font-serif text-2xl text-foreground tracking-tight">{guest.name}</div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-[0.22em] font-mono mt-2 font-bold">
                        {guest.predictedSegment}
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                    {/* Loyalty Score */}
                    <div>
                        <div className="flex justify-between items-baseline mb-3">
                            <span className="text-[9px] text-neutral-400 tracking-[0.2em] uppercase font-bold">LTV Confidence</span>
                            <span className="font-mono text-[10px] text-foreground font-bold">{Math.round(guest.loyaltyScore)}</span>
                        </div>
                        <div className="h-[2px] w-full bg-neutral-100 dark:bg-neutral-800">
                            <div 
                                className="h-full bg-foreground"
                                style={{ width: `${guest.loyaltyScore}%` }}
                            />
                        </div>
                    </div>
                    
                    {/* Churn Risk */}
                    <div>
                        <div className="flex justify-between items-baseline mb-3">
                            <span className="text-[9px] text-neutral-400 tracking-[0.2em] uppercase font-bold">Attrition Risk</span>
                            <span className="font-mono text-[10px] text-foreground font-bold">{Math.round(guest.aiChurnRisk!)}%</span>
                        </div>
                        <div className="h-[2px] w-full bg-neutral-100 dark:bg-neutral-800">
                            <div 
                                className={`h-full ${guest.aiChurnRisk! > 50 ? "bg-rose-500" : "bg-neutral-400"}`}
                                style={{ width: `${guest.aiChurnRisk}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-100 dark:border-neutral-900/50">
                        <div>
                            <span className="block text-[9px] text-neutral-400 dark:text-neutral-500 tracking-[0.2em] uppercase mb-2 font-bold">Proj. Value</span>
                            <span className="font-serif text-xl text-foreground font-medium">${guest.totalSpend.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-[9px] text-neutral-400 dark:text-neutral-500 tracking-[0.2em] uppercase mb-2 font-bold">Intervention</span>
                            <span className="font-mono text-[10px] text-foreground truncate block font-bold uppercase tracking-tight">{guest.topAmenityPredicted}</span>
                        </div>
                    </div>

                    <div className="pt-10">
                        <button
                            onClick={() => handleTakeAction(guest)}
                            disabled={actioningId === guest.id || completedActions.has(guest.id)}
                            className={`w-full py-4 px-4 text-[9px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3 border rounded-none shadow-sm ${
                                completedActions.has(guest.id)
                                    ? "bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-emerald-600 cursor-default shadow-none"
                                    : actioningId === guest.id
                                        ? "bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-400 cursor-wait shadow-none"
                                        : "bg-foreground text-background hover:opacity-90 active:scale-[0.98] border-transparent shadow-xl active:shadow-md"
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
