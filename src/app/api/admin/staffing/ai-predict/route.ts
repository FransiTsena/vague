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

type MemberForAssignment = {
  _id: any;
  name: string;
  role?: string;
  accessRole?: "ADMIN" | "DEPARTMENT_HEAD" | "MEMBER";
  skills?: string[];
  availability?: { dayOfWeek: number; preferredShifts: ShiftType[] }[];
};

const ROLE_PROFILE_BY_DEPARTMENT: Record<string, Record<ShiftType, string[]>> = {
  guest_services: {
    morning: ["front desk agent", "front office manager", "guest relations"],
    swing: ["concierge", "bell attendant", "front desk agent"],
    night: ["night auditor", "front desk agent"],
  },
  front_of_house: {
    morning: ["front desk agent", "front office manager", "guest relations"],
    swing: ["concierge", "bell attendant", "front desk agent"],
    night: ["night auditor", "front desk agent"],
  },
  culinary: {
    morning: ["breakfast cook", "sous chef", "executive chef"],
    swing: ["line cook", "sous chef", "pastry chef"],
    night: ["steward", "line cook", "sous chef"],
  },
  housekeeping: {
    morning: ["room attendant", "housekeeping supervisor"],
    swing: ["public area attendant", "housekeeping supervisor"],
    night: ["laundry attendant", "public area attendant"],
  },
  accommodation: {
    morning: ["room attendant", "housekeeping supervisor"],
    swing: ["public area attendant", "housekeeping supervisor"],
    night: ["laundry attendant", "public area attendant"],
  },
  security: {
    morning: ["security officer", "security chief"],
    swing: ["security officer", "security chief"],
    night: ["security officer", "security chief"],
  },
  facilities: {
    morning: ["maintenance technician", "facilities manager"],
    swing: ["hvac technician", "maintenance technician"],
    night: ["on-call engineer", "maintenance technician"],
  },
  administration: {
    morning: ["duty manager", "general manager", "director of operations"],
    swing: ["duty manager", "director of operations"],
    night: ["night manager", "duty manager"],
  },
};

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

function normalizeText(value: string | undefined | null) {
  return (value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function resolveDepartmentProfileKey(departmentName: string): keyof typeof ROLE_PROFILE_BY_DEPARTMENT {
  const normalized = normalizeText(departmentName);
  if (normalized.includes("guest")) return "guest_services";
  if (normalized.includes("front of house") || normalized.includes("front desk")) return "front_of_house";
  if (normalized.includes("culinary") || normalized.includes("banquet") || normalized.includes("kitchen")) return "culinary";
  if (normalized.includes("housekeeping")) return "housekeeping";
  if (normalized.includes("accommodation")) return "accommodation";
  if (normalized.includes("security")) return "security";
  if (normalized.includes("facilities") || normalized.includes("maintenance") || normalized.includes("engineering")) return "facilities";
  return "administration";
}

function isMemberAvailableForShift(member: MemberForAssignment, dayOfWeek: number, shiftType: ShiftType) {
  if (!member.availability || member.availability.length === 0) return true;
  const dayAvailability = member.availability.find((entry) => entry.dayOfWeek === dayOfWeek);
  if (!dayAvailability || !Array.isArray(dayAvailability.preferredShifts)) return true;
  return dayAvailability.preferredShifts.includes(shiftType);
}

function roleKeywordMatch(member: MemberForAssignment, roleKeywords: string[]) {
  if (!roleKeywords.length) return true;
  const roleText = normalizeText(member.role);
  const skillsText = normalizeText((member.skills || []).join(" "));
  return roleKeywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return roleText.includes(normalizedKeyword) || skillsText.includes(normalizedKeyword);
  });
}

function chooseMemberForShift(params: {
  members: MemberForAssignment[];
  roleKeywords: string[];
  dayOfWeek: number;
  shiftType: ShiftType;
  usedMemberIds: Set<string>;
}) {
  const { members, roleKeywords, dayOfWeek, shiftType, usedMemberIds } = params;

  const scored = members
    .filter((member) => isMemberAvailableForShift(member, dayOfWeek, shiftType))
    .filter((member) => !usedMemberIds.has(String(member._id)))
    .map((member) => {
      const matchesRole = roleKeywordMatch(member, roleKeywords);
      const preferredShift = member.availability?.find((entry) => entry.dayOfWeek === dayOfWeek)?.preferredShifts?.includes(shiftType) ?? false;

      let score = 0;
      if (matchesRole) score += 10;
      if (preferredShift) score += 4;
      if (member.accessRole === "MEMBER") score += 3;
      if (member.accessRole === "DEPARTMENT_HEAD") score += 1;

      return { member, score, matchesRole };
    })
    .sort((a, b) => b.score - a.score);

  const strictCandidate = scored.find((candidate) => candidate.matchesRole);
  if (strictCandidate) return strictCandidate.member;
  return scored[0]?.member || null;
}

function applyRoleAwareAssignments(params: {
  shifts: any[];
  members: MemberForAssignment[];
  departmentName: string;
  dayKey: string;
}) {
  const { shifts, members, departmentName, dayKey } = params;
  const usedMemberIds = new Set<string>();
  const departmentProfile = ROLE_PROFILE_BY_DEPARTMENT[resolveDepartmentProfileKey(departmentName)];
  const dayOfWeek = new Date(`${dayKey}T12:00:00Z`).getUTCDay();

  return shifts.map((shift) => {
    const shiftType = shift.shiftType as ShiftType;
    const roleKeywords = departmentProfile?.[shiftType] || [];

    let assignedMember: MemberForAssignment | null = null;
    if (shift.assignedStaffId) {
      const existing = members.find((member) => String(member._id) === String(shift.assignedStaffId));
      if (
        existing &&
        isMemberAvailableForShift(existing, dayOfWeek, shiftType) &&
        roleKeywordMatch(existing, roleKeywords)
      ) {
        assignedMember = existing;
      }
    }

    if (!assignedMember) {
      assignedMember = chooseMemberForShift({
        members,
        roleKeywords,
        dayOfWeek,
        shiftType,
        usedMemberIds,
      });
    }

    if (assignedMember) {
      usedMemberIds.add(String(assignedMember._id));
    }

    const roleHint = roleKeywords[0] || "service specialist";
    return {
      ...shift,
      assignedStaffId: assignedMember ? String(assignedMember._id) : null,
      description: shift.description || `Recommended role: ${roleHint}`,
      requiredRole: roleHint,
    };
  });
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
    const userResult = await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);
    const user = userResult as any;

    const body = await req.json();
    const { departmentId, date, endDate } = body;

    if (!departmentId || !date) {
      return apiError("departmentId and date are required", 400);
    }

    const startDate = new Date(date);
    const stopDate = endDate ? new Date(endDate) : new Date(date);
    if (isNaN(startDate.getTime()) || isNaN(stopDate.getTime())) {
      return apiError("Invalid date or endDate", 400);
    }
    if (stopDate < startDate) {
      return apiError("endDate must be on or after date", 400);
    }

    const spanDays = Math.ceil((stopDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (spanDays > 56) {
      return apiError("Date range too large. Maximum horizon is 56 days.", 400);
    }

    if (user.accessRole === "DEPARTMENT_HEAD" && String(user.departmentId || "") !== String(departmentId)) {
      return apiError("You can only generate schedules for your department", 403);
    }
    
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

      const normalizedShifts = normalizeDayShifts(p?.suggestedShifts, dayReasoning);
      const roleAwareShifts = applyRoleAwareAssignments({
        shifts: normalizedShifts,
        members: members as unknown as MemberForAssignment[],
        departmentName: department.name,
        dayKey,
      });

      return {
        date: dayKey,
        suggestedStaffCount: Number.isFinite(p?.suggestedStaffCount)
          ? p.suggestedStaffCount
          : Math.max(2, Math.ceil((dayContext?.occupancyRate ?? occupancyRate) / 12)),
        reasoning: dayReasoning,
        suggestedShifts: roleAwareShifts,
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
