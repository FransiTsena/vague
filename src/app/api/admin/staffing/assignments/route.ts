import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ScheduleEvent, Member } from "@/lib/models";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);
    
    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) return apiError("eventId is required", 400);

    const event = await ScheduleEvent.findById(eventId).populate("organizerId", "name email");
    if (!event) return apiError("Event not found", 404);

    // In this simplified model, organizerId or a separate array would store assignments.
    // Given the schema, let's treat the event as the container.
    return apiJson(event);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);

    const body = await req.json();
    const { eventId, memberId } = body;

    if (!eventId || !memberId) return apiError("eventId and memberId are required", 400);

    // Update the event to assign the member as organizer (or add to an assignments array if we extended the model)
    // For now, satisfy the "assign staff" by updating organizerId
    const event = await ScheduleEvent.findByIdAndUpdate(
      eventId,
      { organizerId: new mongoose.Types.ObjectId(memberId) },
      { new: true }
    ).populate("organizerId", "name email");

    return apiJson(event);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
