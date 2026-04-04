import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking, Room, DepartmentModel, ScheduleEvent, Member } from "@/lib/models";
import { getSmartStaffingPrediction } from "@/lib/groq";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

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
        type: "SHIFT",
        startsAt: { $lte: rangeEnd },
        endsAt: { $gte: rangeStart }
      }),
      Member.find({ departmentId }).select("name _id role availability skills")
    ]);

    if (!department) return apiError("Department not found", 404);

    const occupancyRate = totalRooms > 0 ? (bookings.length / totalRooms) * 100 : 0;

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
      startDate: rangeStart.toISOString(),
      endDate: rangeEnd.toISOString()
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

    return apiJson({
      ...prediction,
      currentStaffCount: currentAssignments,
      occupancyAtTime: occupancyRate.toFixed(1) + "%",
    });

  } catch (error: any) {
    console.error("AI Staffing Integration Error:", error);
    return apiError(error.message, 500);
  }
}
