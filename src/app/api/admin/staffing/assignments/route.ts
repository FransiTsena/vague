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

    let eventQuery = ScheduleEvent.findById(eventId)
      .populate("organizerId", "name email");

    if (ScheduleEvent.schema.path("staffIds")) {
      eventQuery = eventQuery.populate("staffIds", "name email");
    }

    const event = await eventQuery;
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
    const { eventId, memberId, action } = body;

    if (!eventId || !memberId) return apiError("eventId and memberId are required", 400);

    let updatePayload;
    if (action === "remove") {
      updatePayload = { $pull: { staffIds: memberId } };
    } else {
      updatePayload = { $addToSet: { staffIds: memberId } };
    }

    let eventUpdateQuery = ScheduleEvent.findByIdAndUpdate(
      eventId,
      updatePayload,
      { new: true }
    );

    if (ScheduleEvent.schema.path("staffIds")) {
      eventUpdateQuery = eventUpdateQuery.populate("staffIds", "name email");
    }

    const event = await eventUpdateQuery;

    return apiJson(event);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
