"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/index";

export type CalendarItem = {
  start: string;
  end: string;
  title: string;
  subtitle?: string;
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
}: {
  items: CalendarItem[];
  title?: string;
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
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="!px-2 !py-1 !text-xs"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          >
            Prev
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            className="!px-2 !py-1 !text-xs"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg bg-zinc-200 dark:bg-zinc-800 shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-zinc-50 px-1 py-2 text-center text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400"
          >
            {w}
          </div>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return (
                <div
                  key={`empty-${wi}-${di}`}
                  className="min-h-[100px] bg-zinc-50/50 dark:bg-zinc-950/50"
                />
              );
            }
            const key = localDateKey(day);
            const isToday = key === todayKey;
            
            const dayItems = items.filter(item => {
                const s = parseISO(item.start);
                const e = parseISO(item.end);
                const dS = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
                const dE = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 0, 0, 0, 0);
                return s < dE && e > dS;
            });

            return (
              <div
                key={key}
                className="min-h-[120px] bg-white p-2 transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {dayItems.map((it, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                      title={`${it.title}${it.subtitle ? ` - ${it.subtitle}` : ""}`}
                    >
                      {it.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
