"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/index";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";

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
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">{title}</h3>
          <p className="text-xl font-serif italic text-zinc-100">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-100" />
          </button>
          <button
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-zinc-100" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-white/5 px-2 py-4 text-center text-[9px] uppercase tracking-[0.3em] font-black text-zinc-500"
          >
            {w}
          </div>
        ))}
        {weeks.flat().map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="min-h-[140px] bg-[#080808]/40" />;
            
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
                className={`min-h-[140px] p-4 transition-all hover:bg-white/[0.03] relative group cursor-pointer ${isToday ? 'bg-amber-500/[0.02]' : 'bg-[#080808]/60'}`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-amber-500/20 rounded-xl z-10" />
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[11px] font-black tracking-widest ${isToday ? 'text-amber-500' : 'opacity-20'}`}>
                    {day.getDate().toString().padStart(2, '0')}
                  </span>
                  {isToday && <div className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />}
                </div>
                
                <div className="flex flex-col gap-1.5 relative z-20">
                  {dayItems.slice(0, 3).map((it, idx) => {
                    const assigned = it.organizerId?.name;
                    const shiftColor = it.shiftType === 'morning' ? 'border-sky-500/30' : it.shiftType === 'swing' ? 'border-amber-500/30' : it.shiftType === 'night' ? 'border-indigo-500/30' : 'border-white/5';
                    const markerColor = it.shiftType === 'morning' ? 'bg-sky-500/40' : it.shiftType === 'swing' ? 'bg-amber-500/40' : it.shiftType === 'night' ? 'bg-indigo-500/40' : 'bg-zinc-500/40';

                    return (
                      <div
                        key={idx}
                        className={`px-2 py-1.5 rounded-lg bg-white/5 border ${shiftColor} text-[9px] font-bold uppercase tracking-widest text-zinc-300 truncate transition-colors group/item relative overflow-hidden flex flex-col gap-0.5`}
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
                    className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-2 border border-dashed border-white/10 py-2 rounded-lg"
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
      <div className="h-8 w-1/4 bg-white/5 rounded-full" />
      <div className="grid grid-cols-7 gap-4">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-3xl" />
        ))}
      </div>
    </div>
  )
}
