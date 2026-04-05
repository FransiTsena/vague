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

    const event = await ScheduleEvent.findById(eventId)
      .populate("organizerId", "name email")
      .populate("staffIds", "name email");
    if (!event) return apiError("Event not found", 404);

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
    const { eventId, memberId, action } = body; // action: 'add' or 'remove'

    if (!eventId || !memberId) return apiError("eventId and memberId are required", 400);

    let updateQuery;
    if (action === "remove") {
      updateQuery = { $pull: { staffIds: memberId } };
    } else {
      updateQuery = { $addToSet: { staffIds: memberId } };
    }

    const event = await ScheduleEvent.findByIdAndUpdate(
      eventId,
      updateQuery,
      { new: true }
    ).populate("staffIds", "name email");

    return apiJson(event);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
