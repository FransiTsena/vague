"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/index";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export type CalendarItem = {
  _id?: string;
  startsAt: string;
  endsAt: string;
  title: string;
  type?: "SHIFT" | "EVENT" | "TASK";
  shiftType?: "morning" | "swing" | "night";
  status?: "DRAFT" | "PUBLISHED" | "COMPLETED";
  organizerId?: {
    _id: string;
    name: string;
    email: string;
  };
  departmentId?: {
    _id: string;
    name: string;
  };
};

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(s: string): Date {
  return new Date(s);
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StaffingCalendar({
  items,
  title = "Staffing Schedule",
  onAddEvent,
  onDeleteEvent,
  onDayClick,
}: {
  items: CalendarItem[];
  title?: string;
  onAddEvent?: (date: Date) => void;
  onDeleteEvent?: (item: CalendarItem) => void;
  onDayClick?: (date: Date, items: CalendarItem[]) => void;
}) {
  const { isDark } = useTheme();
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const { weeks, monthLabel } = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    // Adjust for Monday start: (getDay() + 6) % 7
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = last.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return {
      weeks,
      monthLabel: first.toLocaleString(undefined, { month: "long", year: "numeric" }),
    };
  }, [cursor]);

  const todayKey = localDateKey(new Date());

  return (
    <div className="bg-transparent overflow-hidden">
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{title}</h3>
          <p className={`text-xl font-serif italic ${isDark ? "text-zinc-100" : "text-black"}`}>{monthLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className={`p-3 border transition-all ${isDark ? "bg-white/5 hover:bg-white/10 border-white/5" : "bg-white hover:bg-zinc-50 border-black/5 shadow-md shadow-black/5"}`}
          >
            <ChevronLeft className={`w-4 h-4 ${isDark ? "text-zinc-100" : "text-black"}`} />
          </button>
          <button
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className={`p-3 border transition-all ${isDark ? "bg-white/5 hover:bg-white/10 border-white/5" : "bg-white hover:bg-zinc-50 border-black/5 shadow-md shadow-black/5"}`}
          >
            <ChevronRight className={`w-4 h-4 ${isDark ? "text-zinc-100" : "text-black"}`} />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 gap-px overflow-hidden border shadow-2xl ${isDark ? "bg-white/5 border-white/5" : "bg-zinc-200 border-black/5 shadow-black/5"}`}>
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className={`px-2 py-4 text-center text-[9px] uppercase tracking-[0.3em] font-black ${isDark ? "bg-white/5 text-zinc-500" : "bg-zinc-50 text-zinc-400"}`}
          >
            {w}
          </div>
        ))}
        {weeks.flat().map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className={`min-h-[140px] ${isDark ? "bg-[#080808]/40" : "bg-zinc-100/50"}`} />;
            
            const key = localDateKey(day);
            const isToday = key === todayKey;
            
            const dayItems = Array.isArray(items) ? items.filter(item => {
                const s = parseISO(item.startsAt);
                const e = parseISO(item.endsAt);
                const dS = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
                const dE = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 0, 0, 0, 0);
                return s < dE && e > dS;
            }) : [];

            return (
              <div
                key={key}
                onClick={() => onDayClick?.(day, dayItems)}
                className={`min-h-[140px] p-4 transition-all relative group cursor-pointer ${
                  isDark 
                    ? (isToday ? 'bg-amber-500/[0.02]' : 'bg-[#080808]/60 hover:bg-white/[0.03]') 
                    : (isToday ? 'bg-amber-50/50' : 'bg-white hover:bg-zinc-50')
                }`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border z-10 ${isDark ? "border-amber-500/20" : "border-amber-500/30 shadow-inner"}`} />
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[11px] font-black tracking-widest ${isToday ? 'text-amber-500' : isDark ? 'opacity-20' : 'text-black opacity-30'}`}>
                    {day.getDate().toString().padStart(2, '0')}
                  </span>
                  {isToday && <div className="w-1 h-1 bg-amber-500 animate-ping" />}
                </div>
                
                <div className="flex flex-col gap-1.5 relative z-20">
                  {dayItems.slice(0, 3).map((it, idx) => {
                    const assigned = it.organizerId?.name;
                    const shiftColor = it.shiftType === 'morning' ? 'border-sky-500/30' : it.shiftType === 'swing' ? 'border-amber-500/30' : it.shiftType === 'night' ? 'border-indigo-500/30' : 'border-white/5';
                    const markerColor = it.shiftType === 'morning' ? 'bg-sky-500/40' : it.shiftType === 'swing' ? 'bg-amber-500/40' : it.shiftType === 'night' ? 'bg-indigo-500/40' : 'bg-zinc-500/40';

                    return (
                      <div
                        key={idx}
                        className={`px-2 py-1.5 border ${shiftColor} text-[9px] font-bold uppercase tracking-widest truncate transition-colors group/item relative overflow-hidden flex flex-col gap-0.5 shadow-sm hover:shadow-md ${
                          isDark ? "bg-white/5 text-zinc-300" : "bg-white text-black shadow-black/5"
                        }`}
                        title={it.title}
                      >
                        <div className="flex justify-between items-center relative z-10 w-full">
                          <span className="truncate flex-1 pr-2">{it.title}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent?.(it);
                            }}
                            className="opacity-0 group-hover/item:opacity-40 hover:!opacity-100 transition-opacity flex-shrink-0"
                          >
                             <X className="w-2 h-2 text-rose-500" />
                          </button>
                        </div>
                        {assigned && (
                          <div className="text-[7px] text-zinc-400 lowercase tracking-tighter truncate opacity-70">
                            {assigned}
                          </div>
                        )}
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${markerColor} transition-opacity`} />
                      </div>
                    );
                  })}
                  {dayItems.length > 3 && (
                    <div className="text-[8px] font-black opacity-20 uppercase tracking-widest pl-1 mt-1">
                      + {dayItems.length - 3} More
                    </div>
                  )}
                  {/* Empty state manual trigger */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent?.(day);
                    }}
                    className={`opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-[8px] font-black uppercase tracking-widest mt-2 border border-dashed py-2 ${
                      isDark ? "text-zinc-500 border-white/10" : "text-zinc-400 border-black/10"
                    }`}
                  >
                    + Add Shift
                  </button>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-8">
      <div className="h-8 w-1/4 bg-white/5" />
      <div className="grid grid-cols-7 gap-4">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5" />
        ))}
      </div>
    </div>
  )
}
