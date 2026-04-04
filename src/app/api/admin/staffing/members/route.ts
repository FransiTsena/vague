import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Member, DepartmentModel } from "@/lib/models";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);
    
    const departmentIdParam = req.nextUrl.searchParams.get("departmentId");
    let query: any = {};

    if (user.accessRole === "DEPARTMENT_HEAD") {
      if (!user.departmentId) return apiJson([]);
      query.departmentId = user.departmentId;
    } else if (departmentIdParam) {
      query.departmentId = departmentIdParam;
    }

    const members = await Member.find(query)
      .sort({ name: "asc" })
      .populate("departmentId", "name")
      .lean();

    return apiJson(members);
  } catch (error: any) {
    return apiError(error.message, error.message === "Forbidden" ? 403 : 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await requireUser(["ADMIN", "DEPARTMENT_HEAD"]);

    const body = await req.json();
    const { name, email, role, departmentId, password, accessRole } = body;

    if (!name || !email || !departmentId) {
      return apiError("name, email and departmentId are required", 400);
    }

    if (user.accessRole === "DEPARTMENT_HEAD" && departmentId !== user.departmentId?.toString()) {
      return apiError("You can only add members to your own department", 403);
    }

    let finalAccessRole = accessRole || "MEMBER";
    if (accessRole && user.accessRole !== "ADMIN") {
      return apiError("Only admins can set access role", 403);
    }

    const dept = await DepartmentModel.findById(departmentId);
    if (!dept) return apiError("Department not found", 400);

    let passwordHash = null;
    if (password) {
      if (password.length < 8) return apiError("password must be at least 8 characters", 400);
      passwordHash = await bcrypt.hash(password, 10);
    }

    const member = (await Member.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role?.trim(),
      accessRole: finalAccessRole,
      passwordHash: passwordHash || undefined,
      departmentId,
      portalToken: Math.random().toString(36).substring(7),
    })) as any;

    const populated = await Member.findById(member._id).populate("departmentId", "name").lean();
    return apiJson(populated, 201);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
