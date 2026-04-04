"use client";

import { useEffect, useState } from "react";
import Section from "@/components/ui/Section";
import { useTheme } from "@/context/ThemeContext";
import { BrainCircuit, Activity, LineChart, Target, Sparkles, Send, Loader2, Check } from "lucide-react";

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
    <Section id="guest-intelligence" className={`pb-24 ${isDark ? "bg-[#0a0a0a]" : "bg-neutral-50"}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-3 mb-12 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-neutral-900 dark:text-white tracking-wide">
              Guest Intelligence
            </h2>
            <p className="text-neutral-500 max-w-lg text-sm leading-relaxed">
              Proprietary models predicting lifetime value, behavioral segment shifting, and churn probability in real-time.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="text-[10px] tracking-widest uppercase text-neutral-400">Inference Engine</span>
            <span className="text-sm font-mono text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-neutral-900 dark:bg-white rounded-full"></span> Live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.slice(0, 6).map((guest) => {
            return (
              <div 
                key={guest.id} 
                className="group border-b border-neutral-200 dark:border-neutral-800 pb-8 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex flex-col gap-1">
                    <div className="font-serif text-2xl text-neutral-900 dark:text-white">{guest.name}</div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mt-1">
                        {guest.predictedSegment}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                    {/* Loyalty Score */}
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[10px] text-neutral-400 tracking-widest uppercase">LTV Confidence</span>
                            <span className="font-mono text-xs text-neutral-900 dark:text-white">{Math.round(guest.loyaltyScore)}/100</span>
                        </div>
                        <div className="h-[1px] w-full bg-neutral-200 dark:bg-neutral-800">
                            <div 
                                className="h-full bg-neutral-900 dark:bg-white"
                                style={{ width: `${guest.loyaltyScore}%` }}
                            />
                        </div>
                    </div>
                    
                    {/* Churn Risk */}
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[10px] text-neutral-400 tracking-widest uppercase">Attrition Risk</span>
                            <span className="font-mono text-xs text-neutral-900 dark:text-white">{Math.round(guest.aiChurnRisk!)}%</span>
                        </div>
                        <div className="h-[1px] w-full bg-neutral-200 dark:bg-neutral-800">
                            <div 
                                className="h-full bg-neutral-400 dark:bg-neutral-600"
                                style={{ width: `${guest.aiChurnRisk}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-neutral-100 dark:border-neutral-900/50">
                        <div>
                            <span className="block text-[10px] text-neutral-400 tracking-widest uppercase mb-2">Proj. Value</span>
                            <span className="font-serif text-lg text-neutral-900 dark:text-white">${guest.totalSpend.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-neutral-400 tracking-widest uppercase mb-2">Next Conversion</span>
                            <span className="font-mono text-sm text-neutral-900 dark:text-white truncate block">{guest.topAmenityPredicted}</span>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={() => handleTakeAction(guest)}
                            disabled={actioningId === guest.id || completedActions.has(guest.id)}
                            className={`w-full py-3 px-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 border ${
                                completedActions.has(guest.id)
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-default"
                                    : actioningId === guest.id
                                        ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 cursor-wait"
                                        : "bg-neutral-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98] border-transparent"
                            }`}
                        >
                            {completedActions.has(guest.id) ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    Offer Dispatched
                                </>
                            ) : actioningId === guest.id ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    AI Strategy...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3 h-3" />
                                    Recover & Upsell
                                </>
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
