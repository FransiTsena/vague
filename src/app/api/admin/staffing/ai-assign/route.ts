import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ScheduleEvent, Member, Booking, Room } from "@/lib/models";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

type ShiftType = "morning" | "swing" | "night";

interface MemberRecord {
  _id: any;
  name: string;
  role?: string;
  accessRole?: "ADMIN" | "DEPARTMENT_HEAD" | "MEMBER";
  skills?: string[];
  availability?: { dayOfWeek: number; preferredShifts: ShiftType[] }[];
  departmentId?: any;
}

// ── Constants ────────────────────────────────────────────────────────────────

/**
 * Shift-type demand weight.
 * Morning needs more coverage (check-ins, breakfast), night needs less.
 */
const SHIFT_WEIGHT: Record<ShiftType, number> = {
  morning: 1.3,
  swing:   1.0,
  night:   0.7,
};

/**
 * Preferred role keywords per department category per shift type.
 * Used to score candidates — NOT to exclude them.
 */
const ROLE_PROFILE: Record<string, Record<ShiftType, string[]>> = {
  guest_services: {
    morning: ["front desk agent", "front office manager", "guest relations"],
    swing:   ["concierge", "bell attendant", "front desk agent"],
    night:   ["night auditor", "front desk agent"],
  },
  "culinary & banquets": {
    morning: ["breakfast cook", "sous chef", "executive chef"],
    swing:   ["line cook", "sous chef", "pastry chef"],
    night:   ["steward", "line cook", "sous chef"],
  },
  housekeeping: {
    morning: ["room attendant", "housekeeping supervisor"],
    swing:   ["public area attendant", "housekeeping supervisor"],
    night:   ["laundry attendant", "public area attendant"],
  },
  security: {
    morning: ["security officer", "security chief"],
    swing:   ["security officer", "security chief"],
    night:   ["security officer", "security chief"],
  },
  administration: {
    morning: ["duty manager", "general manager", "director of operations"],
    swing:   ["duty manager", "director of operations"],
    night:   ["night manager", "duty manager"],
  },
};

// ── Pure utility functions ────────────────────────────────────────────────────

function norm(v: string | undefined | null): string {
  return (v ?? "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function resolveDeptKey(deptName: string): string {
  const n = norm(deptName);
  if (n.includes("guest") || n.includes("front desk") || n.includes("front of house")) return "guest_services";
  if (n.includes("culinary") || n.includes("banquet") || n.includes("kitchen")) return "culinary & banquets";
  if (n.includes("housekeeping") || n.includes("accommodation")) return "housekeeping";
  if (n.includes("security")) return "security";
  return "administration";
}

/** Returns true if the member prefers (or has no stated preference against) this shift type on this day. */
function preferredForShift(m: MemberRecord, dow: number, shiftType: ShiftType): boolean {
  if (!m.availability || m.availability.length === 0) return true;
  const entry = m.availability.find((a) => a.dayOfWeek === dow);
  if (!entry || !Array.isArray(entry.preferredShifts) || entry.preferredShifts.length === 0) return true;
  return entry.preferredShifts.includes(shiftType);
}

/** Returns true if the member's role/skills loosely match any of the preferred keywords. */
function roleMatches(m: MemberRecord, keywords: string[]): boolean {
  if (!keywords.length) return true;
  const blob = norm(m.role) + " " + norm((m.skills ?? []).join(" "));
  return keywords.some((kw) => blob.includes(norm(kw)));
}

/**
 * How many staff are needed for one shift given that day's hotel occupancy.
 *
 * Base scale (per shift):
 *   < 30%  → 1
 *   30–59% → 2
 *   60–79% → 3
 *   80–100%→ 4
 *   > 100% → 5  (overbooked — all hands)
 *
 * Then multiplied by the shift-type weight and capped at available pool.
 */
function demandCount(occupancyPct: number, shiftType: ShiftType, poolSize: number): number {
  let base: number;
  if      (occupancyPct <  30)  base = 1;
  else if (occupancyPct <  60)  base = 2;
  else if (occupancyPct <  80)  base = 3;
  else if (occupancyPct <= 100) base = 4;
  else                          base = 5;

  return Math.max(1, Math.min(Math.ceil(base * SHIFT_WEIGHT[shiftType]), poolSize));
}

/**
 * Fair candidate selection — the core of this module.
 *
 * Priority tiers (in strict order):
 *   Tier 1: not working today + role matches + shift preferred
 *   Tier 2: not working today + role matches  (wrong shift pref or no pref)
 *   Tier 3: not working today + any role      (wrong role but available today)
 *   Tier 4: already on a shift today + role matches  (last resort, avoids service gap)
 *   Tier 5: already on a shift today + any role      (absolute last resort)
 *
 * Within each tier, candidates are sorted by ascending workload (fewest shifts
 * assigned so far), which is the key fairness guarantee. Ties broken by role
 * score then shift preference.
 *
 * @param pool       Candidate pool (dept-specific or global)
 * @param keywords   Preferred role keywords for this shift
 * @param dow        Day-of-week (0=Sun … 6=Sat)
 * @param shiftType  "morning" | "swing" | "night"
 * @param busyToday  Staff already assigned to another shift today (hard → soft)
 * @param workload   Running total of assignments per member (UPDATED BY CALLER)
 * @param count      How many candidates to return
 */
function selectCandidates(
  pool: MemberRecord[],
  keywords: string[],
  dow: number,
  shiftType: ShiftType,
  busyToday: Set<string>,
  workload: Map<string, number>,
  count: number,
): MemberRecord[] {
  // Score every member in the pool
  const scored = pool.map((m) => {
    const id = String(m._id);
    return {
      m,
      wload:    workload.get(id) ?? 0,
      busy:     busyToday.has(id),
      roleFit:  roleMatches(m, keywords),
      prefFit:  preferredForShift(m, dow, shiftType),
    };
  });

  // Build tiers — order within tier: wload ASC, then roleFit DESC, prefFit DESC
  const tierSort = (a: typeof scored[0], b: typeof scored[0]) => {
    if (a.wload !== b.wload)  return a.wload - b.wload;
    if (a.roleFit !== b.roleFit) return Number(b.roleFit) - Number(a.roleFit);
    return Number(b.prefFit) - Number(a.prefFit);
  };

  const tier1 = scored.filter((s) => !s.busy && s.roleFit && s.prefFit).sort(tierSort);
  const tier2 = scored.filter((s) => !s.busy && s.roleFit && !s.prefFit).sort(tierSort);
  const tier3 = scored.filter((s) => !s.busy && !s.roleFit).sort(tierSort);
  const tier4 = scored.filter((s) =>  s.busy && s.roleFit).sort(tierSort);
  const tier5 = scored.filter((s) =>  s.busy && !s.roleFit).sort(tierSort);

  const ordered = [...tier1, ...tier2, ...tier3, ...tier4, ...tier5];

  // Pick `count` unique members
  const result: MemberRecord[] = [];
  const seen = new Set<string>();
  for (const { m } of ordered) {
    const id = String(m._id);
    if (seen.has(id)) continue;
    result.push(m);
    seen.add(id);
    if (result.length >= count) break;
  }
  return result;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);

    const body = await req.json().catch(() => ({}));
    const { departmentId } = body;

    // ── 1. Load vacant shifts ──────────────────────────────────────────────
    const shiftQuery: any = { $or: [{ type: "SHIFT" }, { type: { $exists: false } }] };
    if (departmentId && departmentId !== "all") shiftQuery.departmentId = departmentId;

    const allShifts: any[] = await ScheduleEvent.find(shiftQuery)
      .populate("departmentId", "name")
      .populate("staffIds", "_id")
      .sort({ startsAt: 1 })
      .lean();

    const alreadyStaffedCount = allShifts.filter(
      (s) => Array.isArray(s.staffIds) && s.staffIds.length > 0
    ).length;

    const vacantShifts = allShifts.filter(
      (s) => !Array.isArray(s.staffIds) || s.staffIds.length === 0
    );

    if (vacantShifts.length === 0) {
      return apiJson({
        message: "All shifts already have staff assigned.",
        assigned: 0,
        shiftsProcessed: 0,
        alreadyStaffed: alreadyStaffedCount,
        skipped: 0,
        averageOccupancy: null,
      });
    }

    // ── 2. Real demand data: bookings × rooms ──────────────────────────────
    const shiftDates = vacantShifts.map((s) => new Date(s.startsAt).getTime());
    const rangeStart = new Date(Math.min(...shiftDates));
    const rangeEnd   = new Date(Math.max(...shiftDates));
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);

    const [totalRooms, bookings] = await Promise.all([
      Room.countDocuments(),
      Booking.find({ checkIn: { $lte: rangeEnd }, checkOut: { $gte: rangeStart } }).lean(),
    ]);

    /** Occupancy % for a given UTC date midnight */
    const occupancyOn = (date: Date): number => {
      if (!totalRooms) return 50; // no room data → assume moderate load
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);
      const count = (bookings as any[]).filter((b) => {
        const ci = new Date(b.checkIn);
        const co = new Date(b.checkOut);
        return ci <= dayEnd && co >= dayStart;
      }).length;
      return Math.round((count / totalRooms) * 100);
    };

    // ── 3. Load staff ──────────────────────────────────────────────────────
    const memberQuery: any = {};
    if (departmentId && departmentId !== "all") memberQuery.departmentId = departmentId;

    const allMembers: MemberRecord[] = await Member.find(memberQuery)
      .select("name _id role accessRole skills availability departmentId")
      .lean();

    if (allMembers.length === 0) {
      return apiError("No staff members found. Please seed staff first.", 400);
    }

    // dept id → members for that dept (pre-computed for performance)
    const membersByDept = new Map<string, MemberRecord[]>();
    for (const m of allMembers) {
      const key = String((m as any).departmentId ?? "");
      if (!membersByDept.has(key)) membersByDept.set(key, []);
      membersByDept.get(key)!.push(m);
    }

    // ── 4. Global workload counter — STARTS AT 0 FOR EVERY MEMBER ─────────
    // This is the single source of truth for fairness.
    const workload = new Map<string, number>();
    for (const m of allMembers) workload.set(String(m._id), 0);

    // ── 5. Process shifts — grouped by date so we can enforce day-exclusions
    const byDate = new Map<string, any[]>();
    for (const s of vacantShifts) {
      const dk = new Date(s.startsAt).toISOString().split("T")[0];
      if (!byDate.has(dk)) byDate.set(dk, []);
      byDate.get(dk)!.push(s);
    }

    let totalAssigned = 0;
    let totalOccSum   = 0;
    const log: {
      shiftTitle: string;
      date: string;
      occupancy: number;
      staffRequired: number;
      assigned: string[];
    }[] = [];

    // Sort dates ascending to process chronologically
    for (const dateKey of [...byDate.keys()].sort()) {
      const dayShifts  = byDate.get(dateKey)!;
      const dayDate    = new Date(`${dateKey}T12:00:00Z`);
      const dow        = dayDate.getUTCDay();
      const occupancy  = occupancyOn(dayDate);

      // Hard exclusion: tracks who is already on a shift today
      // Reset per day — a person can work on different days
      const busyToday = new Set<string>();

      // Process morning → swing → night so earlier shifts get priority
      const ORDER: Record<ShiftType, number> = { morning: 0, swing: 1, night: 2 };
      dayShifts.sort((a, b) => (ORDER[a.shiftType as ShiftType] ?? 1) - (ORDER[b.shiftType as ShiftType] ?? 1));

      for (const shift of dayShifts) {
        const deptId   = String((shift.departmentId as any)?._id ?? shift.departmentId ?? "");
        const deptName = (shift.departmentId as any)?.name ?? "administration";
        const deptKey  = resolveDeptKey(deptName);
        const profile  = ROLE_PROFILE[deptKey] ?? ROLE_PROFILE["administration"];
        const sType    = (shift.shiftType as ShiftType) ?? "morning";
        const keywords = profile[sType] ?? [];

        // Prefer dept-specific pool; widen to all staff only if needed
        const deptPool: MemberRecord[] = membersByDept.get(deptId) ?? [];
        const needed = demandCount(occupancy, sType, Math.max(deptPool.length, allMembers.length));

        // Pass 1: try to fill from dept pool
        let candidates = selectCandidates(deptPool, keywords, dow, sType, busyToday, workload, needed);

        // Pass 2: supplement from global pool if dept pool insufficient
        if (candidates.length < needed) {
          const alreadyChosen = new Set(candidates.map((c) => String(c._id)));
          const broader = allMembers.filter((m) => !alreadyChosen.has(String(m._id)));
          const extra   = selectCandidates(broader, keywords, dow, sType, busyToday, workload, needed - candidates.length);
          candidates    = [...candidates, ...extra];
        }

        if (candidates.length === 0) continue;

        // Persist to DB
        await ScheduleEvent.findByIdAndUpdate(
          shift._id,
          { $addToSet: { staffIds: { $each: candidates.map((c) => c._id) } } }
        );

        // Update tracking — CRITICAL: workload updated IMMEDIATELY after each pick
        for (const c of candidates) {
          const id = String(c._id);
          busyToday.add(id);
          workload.set(id, (workload.get(id) ?? 0) + 1);
        }

        totalAssigned += candidates.length;
        totalOccSum   += occupancy;
        log.push({
          shiftTitle: shift.title,
          date: dateKey,
          occupancy,
          staffRequired: needed,
          assigned: candidates.map((c) => c.name),
        });
      }
    }

    const avgOccupancy = log.length > 0 ? Math.round(totalOccSum / log.length) : 0;

    return apiJson({
      message: `AI deployed ${totalAssigned} staff across ${log.length} shifts (avg ${avgOccupancy}% occupancy).`,
      assigned: totalAssigned,
      shiftsProcessed: log.length,
      alreadyStaffed: alreadyStaffedCount,
      skipped: vacantShifts.length - log.length,
      averageOccupancy: avgOccupancy,
      log,
    });

  } catch (error: any) {
    console.error("AI Auto-Assign Error:", error);
    return apiError(error.message, 500);
  }
}
