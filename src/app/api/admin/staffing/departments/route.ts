import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DepartmentModel, Member, ScheduleEvent } from "@/lib/models";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const userResult = await requireUser(["ADMIN", "DEPARTMENT_HEAD", "MEMBER"]);
    const user = userResult as any;

    let query: any = {};
    if (user.accessRole === "DEPARTMENT_HEAD" || user.accessRole === "MEMBER") {
      if (!user.departmentId) return apiJson([]);
      query._id = user.departmentId;
    }

    const depts = await DepartmentModel.find(query).sort({ name: "asc" }).lean();
    
    // Supplement with counts
    const withCounts = await Promise.all(depts.map(async (d: any) => {
      const memberCount = await Member.countDocuments({ departmentId: d._id });
      const eventCount = await ScheduleEvent.countDocuments({ departmentId: d._id });
      return {
        ...d,
        _count: { members: memberCount, events: eventCount }
      };
    }));

    return apiJson(withCounts);
  } catch (error: any) {
    return apiError(error.message, error.message === "Forbidden" ? 403 : 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await requireUser(["ADMIN"]);

    const body = await req.json();
    const { name, description } = body;

    if (!name || !name.trim()) return apiError("name is required", 400);

    const department = await DepartmentModel.create({
      name: name.trim(),
      description,
    });

    return apiJson(department, 201);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
