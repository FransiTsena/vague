import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ScheduleEvent, DepartmentModel, Member } from "@/lib/models";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const user = await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);
    const departmentIdParam = req.nextUrl.searchParams.get("departmentId");

    let query: any = {};
    if (user.accessRole === "DEPARTMENT_HEAD") {
      if (!user.departmentId) return apiJson([]);
      query.departmentId = user.departmentId;
    } else if (departmentIdParam) {
      query.departmentId = departmentIdParam;
    }

    const items = await ScheduleEvent.find(query)
      .sort({ startsAt: "asc" })
      .populate("departmentId", "name")
      .populate("organizerId", "name email")
      .lean();

    return apiJson(items);
  } catch (error: any) {
    return apiError(error.message, error.message === "Unauthorized" ? 401 : 403);
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const user = await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);
    
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const { title, description, startsAt, endsAt, departmentId, organizerId } = body;
    
    if (!title || !title.trim()) return apiError("title is required", 400);
    if (!departmentId) return apiError("departmentId is required", 400);
    
    if (user.accessRole === "DEPARTMENT_HEAD" && departmentId !== user.departmentId) {
      return apiError("You can only create events for your department", 403);
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return apiError("Invalid date values", 400);
    if (end <= start) return apiError("endsAt must be after startsAt", 400);

    const dept = await DepartmentModel.findById(departmentId);
    if (!dept) return apiError("Department not found", 400);

    if (organizerId) {
      const org = await Member.findOne({ _id: organizerId, departmentId });
      if (!org) return apiError("Organizer must belong to the same department", 400);
    }

    const event = await ScheduleEvent.create({
      title: title.trim(),
      description,
      startsAt: start,
      endsAt: end,
      departmentId,
      organizerId: organizerId || null,
    });

    const populated = await event.populate([
      { path: "departmentId", select: "name" },
      { path: "organizerId", select: "name email" }
    ]);

    return apiJson(populated, 201);
  } catch (error: any) {
    return apiError(error.message, 401);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);
    
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return apiError("id is required", 400);

    const result = await ScheduleEvent.findByIdAndDelete(id);
    if (!result) return apiError("Event not found", 404);

    return apiJson({ success: true });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
