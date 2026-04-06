import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ScheduleEvent, DepartmentModel, Member } from "@/lib/models";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const userResult = await requireUser(["ADMIN", "DEPARTMENT_HEAD", "MEMBER"]);
    const user = userResult as any;
    const departmentIdParam = req.nextUrl.searchParams.get("departmentId");
    const typeParam = req.nextUrl.searchParams.get("type");

    let query: any = {};
    if (user.accessRole === "DEPARTMENT_HEAD") {
      if (!user.departmentId) return apiJson([]);
      query.departmentId = user.departmentId;
    } else if (user.accessRole === "MEMBER") {
      // If a regular member is accessing the dashboard, filter by their department
      if (!user.departmentId) {
        query.organizerId = user.id;
      } else {
        query.departmentId = user.departmentId;
      }
    } else if (user.accessRole === "ADMIN") {
      // Admins (GM) can see all, but can also filter by departmentId param if provided
      if (departmentIdParam) {
        query.departmentId = departmentIdParam;
      }
    }

    if (typeParam === "SHIFT") {
      // Backward compatibility: old records may not have the type field populated.
      query.$or = [{ type: "SHIFT" }, { type: { $exists: false } }];
    } else if (typeParam) {
      query.type = typeParam;
    }

    let itemsQuery = ScheduleEvent.find(query)
      .sort({ startsAt: "asc" })
      .populate("departmentId", "name")
      .populate("organizerId", "name email");

    if (ScheduleEvent.schema.path("staffIds")) {
      itemsQuery = itemsQuery.populate("staffIds", "name email");
    }

    const items = await itemsQuery.lean();

    if (user.accessRole === "MEMBER") {
      return apiJson(items.filter((item: any) => String(item.organizerId) === String(user.id)));
    }

    return apiJson(items);
  } catch (error: any) {
    return apiError(error.message, error.message === "Unauthorized" ? 401 : 403);
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const userResult = await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);
    const user = userResult as any;
    
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const bulkItems = Array.isArray(body)
      ? body
      : Array.isArray(body?.items)
        ? body.items
        : null;

    // Handle Bulk Operations
    if (bulkItems) {
      const replaceExisting = !!body?.replaceExisting;
      const replaceStart = body?.replaceRangeStart ? new Date(body.replaceRangeStart) : null;
      const replaceEnd = body?.replaceRangeEnd ? new Date(body.replaceRangeEnd) : null;

      if (replaceExisting && replaceStart && replaceEnd && !isNaN(replaceStart.getTime()) && !isNaN(replaceEnd.getTime())) {
        const targetDept = bulkItems[0]?.departmentId;
        if (targetDept) {
          await ScheduleEvent.deleteMany({
            departmentId: targetDept,
            startsAt: { $lte: replaceEnd },
            endsAt: { $gte: replaceStart },
            $and: [
              { $or: [{ type: "SHIFT" }, { type: { $exists: false } }] },
              { $or: [{ status: "DRAFT" }, { status: { $exists: false } }] },
            ],
          });
        }
      }

      const results = [];
      for (const item of bulkItems) {
        const { title, description, startsAt, endsAt, departmentId, organizerId, type, shiftType, status } = item;
        
        if (!title || !departmentId) continue;
        
        const start = new Date(startsAt);
        const end = new Date(endsAt);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) continue;

        if (user.accessRole === "DEPARTMENT_HEAD" && String(departmentId) !== String(user.departmentId || "")) {
          continue;
        }

        if (organizerId) {
          const org = await Member.findOne({ _id: organizerId, departmentId });
          if (!org) continue;
        }

        const event = await ScheduleEvent.create({
          title: title.trim(),
          description,
          startsAt: start,
          endsAt: end,
          departmentId,
          organizerId: organizerId || null,
          type: type || "SHIFT",
          shiftType: shiftType,
          status: status || "PUBLISHED"
        });
        results.push(event);
      }
      return apiJson({ success: true, count: results.length, items: results }, 201);
    }

    const { title, description, startsAt, endsAt, departmentId, organizerId, type, shiftType, status } = body;
    
    if (!title || !title.trim()) return apiError("title is required", 400);
    if (!departmentId) return apiError("departmentId is required", 400);
    
    if (user.accessRole === "DEPARTMENT_HEAD" && String(departmentId) !== String(user.departmentId || "")) {
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
      type: type || (shiftType ? "SHIFT" : "EVENT"),
      shiftType: shiftType,
      status: status || "PUBLISHED"
    });

    const populated = await event.populate([
      { path: "departmentId", select: "name" },
      { path: "organizerId", select: "name email" }
    ]);

    return apiJson(populated, 201);
  } catch (error: any) {
    const status = error?.message === "Unauthorized" ? 401 : error?.message === "Forbidden" ? 403 : 400;
    return apiError(error.message, status);
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  try {
    const user = await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return apiError("id is required", 400);

    const body = await req.json();
    const event = await ScheduleEvent.findById(id);
    if (!event) return apiError("Event not found", 404);

    if (user.accessRole === "DEPARTMENT_HEAD" && event.departmentId.toString() !== user.departmentId) {
      return apiError("You can only update events for your department", 403);
    }

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.startsAt) updateData.startsAt = new Date(body.startsAt);
    if (body.endsAt) updateData.endsAt = new Date(body.endsAt);
    if (body.organizerId !== undefined) updateData.organizerId = body.organizerId;
    if (body.type) updateData.type = body.type;
    if (body.shiftType) updateData.shiftType = body.shiftType;
    if (body.status) updateData.status = body.status;
    if (body.staffIds !== undefined) updateData.staffIds = body.staffIds;

    const updated = await ScheduleEvent.findByIdAndUpdate(id, updateData, { new: true }).populate([
      { path: "departmentId", select: "name" },
      { path: "organizerId", select: "name email" }
    ]);

    return apiJson(updated);
  } catch (error: any) {
    return apiError(error.message, 500);
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
