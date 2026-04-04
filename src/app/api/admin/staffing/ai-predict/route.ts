import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking, Room, DepartmentModel, ScheduleEvent, StaffAssignment } from "@/lib/models";
import { getSmartStaffingPrediction } from "@/lib/groq";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);

    const body = await req.json();
    const { departmentId, date } = body;

    if (!departmentId || !date) {
      return apiError("departmentId and date are required", 400);
    }

    const targetDate = new Date(date);
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    // 1. Gather Context for AI
    const [totalRooms, bookedRooms, department, events, currentAssignments] = await Promise.all([
      Room.countDocuments(),
      Booking.countDocuments({
        checkIn: { $lte: dayEnd },
        checkOut: { $gte: dayStart }
      }),
      DepartmentModel.findById(departmentId),
      ScheduleEvent.find({
        departmentId,
        startsAt: { $lte: dayEnd },
        endsAt: { $gte: dayStart }
      }),
      StaffAssignment.countDocuments({
        departmentId,
        startsAt: { $lte: dayEnd },
        endsAt: { $gte: dayStart }
      })
    ]);

    if (!department) return apiError("Department not found", 404);

    const occupancyRate = totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0;

    // 2. Call AI Engine (using Groq)
    const prediction = await getSmartStaffingPrediction({
      department: department.name,
      occupancyRate,
      upcomingBookings: bookedRooms,
      activeEvents: events.map(e => e.title),
      historicalDemand: "High Season" // In a real app, this would be computed from history
    });

    if (!prediction) {
      // Fallback logic if AI is unavailable
      return apiJson({
        suggestedStaffCount: Math.ceil(bookedRooms / 10), 
        reasoning: "Rule-based fallback: 1 staff per 10 booked rooms.",
        riskLevel: "medium",
        currentStaff: currentAssignments
      });
    }

    return apiJson({
      ...prediction,
      currentStaff: currentAssignments,
      occupancyAtTime: occupancyRate.toFixed(1) + "%",
      isUnderstaffed: currentAssignments < prediction.suggestedStaffCount
    });

  } catch (error: any) {
    console.error("AI Staffing Integration Error:", error);
    return apiError(error.message, 500);
  }
}
