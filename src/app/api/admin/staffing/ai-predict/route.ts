import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking, Room, DepartmentModel, ScheduleEvent, Member } from "@/lib/models";
import { getSmartStaffingPrediction } from "@/lib/groq";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

const SHIFT_TEMPLATES = {
  morning: { title: "Morning Shift", startTime: "07:00", endTime: "15:00" },
  swing: { title: "Swing Shift", startTime: "15:00", endTime: "23:00" },
  night: { title: "Night Shift", startTime: "23:00", endTime: "07:00" }
} as const;

type ShiftType = "morning" | "swing" | "night";

function toDayKey(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function enumerateDayKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  const stop = new Date(end);
  stop.setHours(0, 0, 0, 0);

  while (cursor <= stop) {
    keys.push(toDayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

function normalizeDayShifts(rawShifts: any[] | undefined, fallbackReasoning: string) {
  const byType = new Map<ShiftType, any>();

  for (const raw of rawShifts || []) {
    const normalizedType = ["morning", "swing", "night"].includes(raw?.shiftType)
      ? (raw.shiftType as ShiftType)
      : null;

    if (!normalizedType || byType.has(normalizedType)) continue;

    const template = SHIFT_TEMPLATES[normalizedType];
    byType.set(normalizedType, {
      title: typeof raw?.title === "string" && raw.title.trim() ? raw.title.trim() : template.title,
      startTime: typeof raw?.startTime === "string" && raw.startTime.includes(":") ? raw.startTime : template.startTime,
      endTime: typeof raw?.endTime === "string" && raw.endTime.includes(":") ? raw.endTime : template.endTime,
      shiftType: normalizedType,
      description: typeof raw?.description === "string" && raw.description.trim() ? raw.description.trim() : fallbackReasoning,
      assignedStaffId: raw?.assignedStaffId || null,
    });
  }

  const normalized = (["morning", "swing", "night"] as ShiftType[]).map((type) => {
    const existing = byType.get(type);
    if (existing) return existing;

    const template = SHIFT_TEMPLATES[type];
    return {
      title: template.title,
      startTime: template.startTime,
      endTime: template.endTime,
      shiftType: type,
      description: fallbackReasoning,
      assignedStaffId: null,
    };
  });

  return normalized;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);

    const body = await req.json();
    const { departmentId, date, endDate } = body;

    if (!departmentId || !date) {
      return apiError("departmentId and date are required", 400);
    }

    const startDate = new Date(date);
    const stopDate = endDate ? new Date(endDate) : new Date(date);
    
    // Set to start and end of range
    const rangeStart = new Date(startDate.setHours(0, 0, 0, 0));
    const rangeEnd = new Date(stopDate.setHours(23, 59, 59, 999));
    const dayKeys = enumerateDayKeys(rangeStart, rangeEnd);

    // 1. Gather Context for AI (Aggregated over range)
    const [totalRooms, bookings, department, events, currentAssignments, members] = await Promise.all([
      Room.countDocuments(),
      Booking.find({
        checkIn: { $lte: rangeEnd },
        checkOut: { $gte: rangeStart }
      }),
      DepartmentModel.findById(departmentId),
      ScheduleEvent.find({
        departmentId,
        startsAt: { $lte: rangeEnd },
        endsAt: { $gte: rangeStart }
      }),
      ScheduleEvent.countDocuments({
        departmentId,
        $or: [{ type: "SHIFT" }, { type: { $exists: false } }],
        startsAt: { $lte: rangeEnd },
        endsAt: { $gte: rangeStart }
      }),
      Member.find({ departmentId }).select("name _id role availability skills")
    ]);

    if (!department) return apiError("Department not found", 404);

    const occupancyRate = totalRooms > 0 ? (bookings.length / totalRooms) * 100 : 0;
    const occupancyByDay = dayKeys.map((dayKey) => {
      const dayStart = new Date(`${dayKey}T00:00:00.000Z`);
      const dayEnd = new Date(`${dayKey}T23:59:59.999Z`);

      const bookedForDay = bookings.filter((b: any) => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        return checkIn <= dayEnd && checkOut >= dayStart;
      }).length;

      const dayOccupancy = totalRooms > 0 ? (bookedForDay / totalRooms) * 100 : 0;
      return {
        date: dayKey,
        booked: bookedForDay,
        totalRooms,
        occupancyRate: Number(dayOccupancy.toFixed(1)),
      };
    });

    // 2. Call AI Engine (using Groq)
    const prediction = await getSmartStaffingPrediction({
      department: department.name,
      occupancyRate,
      upcomingBookings: bookings.length,
      activeEvents: events.map(e => e.title),
      historicalDemand: "High Season",
      availableStaff: members.map(m => ({ 
        name: m.name, 
        id: m._id, 
        role: m.role,
        skills: m.skills,
        availability: m.availability
      })),
      occupancyByDay,
      startDate: rangeStart.toISOString().split('T')[0],
      endDate: rangeEnd.toISOString().split('T')[0]
    });

    if (!prediction) {
      // Fallback logic: Generate 1 week of shifts if endDate is provided
      const suggestions = [];
      const curr = new Date(rangeStart);
      while (curr <= rangeEnd) {
        const dateStr = curr.toISOString().split('T')[0];
        suggestions.push({
          date: dateStr,
          suggestedStaffCount: Math.ceil(occupancyRate / 10) || 2,
          reasoning: "Rule-based fallback: 1 staff per 10% occupancy.",
          suggestedShifts: [
            { title: "Morning Shift", startTime: "07:00", endTime: "15:00", shiftType: "morning" },
            { title: "Swing Shift", startTime: "15:00", endTime: "23:00", shiftType: "swing" },
            { title: "Night Shift", startTime: "23:00", endTime: "07:00", shiftType: "night" }
          ]
        });
        curr.setDate(curr.getDate() + 1);
      }
      return apiJson({ predictions: suggestions });
    }

    const sourcePredictions = Array.isArray(prediction.predictions)
      ? prediction.predictions
      : prediction.date
        ? [prediction]
        : [];

    const byDate = new Map<string, any>();
    for (const p of sourcePredictions) {
      if (!p?.date) continue;
      const dateKey = toDayKey(p.date);
      if (!byDate.has(dateKey)) byDate.set(dateKey, p);
    }

    const normalizedPredictions = dayKeys.map((dayKey) => {
      const p = byDate.get(dayKey);
      const dayContext = occupancyByDay.find((d) => d.date === dayKey);
      const dayReasoning = typeof p?.reasoning === "string" && p.reasoning.trim()
        ? p.reasoning
        : (prediction.reasoning || "Demand-balanced staffing generated for this day.");

      return {
        date: dayKey,
        suggestedStaffCount: Number.isFinite(p?.suggestedStaffCount)
          ? p.suggestedStaffCount
          : Math.max(2, Math.ceil((dayContext?.occupancyRate ?? occupancyRate) / 12)),
        reasoning: dayReasoning,
        suggestedShifts: normalizeDayShifts(p?.suggestedShifts, dayReasoning),
      };
    });

    return apiJson({
      ...prediction,
      predictions: normalizedPredictions,
      currentStaffCount: currentAssignments,
      occupancyAtTime: occupancyRate.toFixed(1) + "%",
    });

  } catch (error: any) {
    console.error("AI Staffing Integration Error:", error);
    return apiError(error.message, 500);
  }
}
