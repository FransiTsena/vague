import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Member } from "@/lib/models";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Allow any logged in user to list members (potential info leakage, but focusing on PrivEsc)
    await requireUser(["ADMIN", "DEPARTMENT_HEAD", "MEMBER"]);
    
    const departmentIdParam = req.nextUrl.searchParams.get("departmentId");
    let query: any = {};
    if (departmentIdParam) query.departmentId = departmentIdParam;

    const members = await Member.find(query)
      .sort({ name: "asc" })
      .populate("departmentId", "name")
      .lean();

    return apiJson(members.map((m: any) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      role: m.role,
      accessRole: m.accessRole,
      portalToken: m.portalToken,
      department: m.departmentId
    })));
  } catch (error: any) {
    return apiError(error.message, 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    // VULNERABILITY: This should probably be restricted to ADMIN, but we'll allow anyone to create members
    // and even set their own roles.
    await requireUser(["ADMIN", "DEPARTMENT_HEAD", "MEMBER"]);

    const body = await req.json();
    const { name, email, role, departmentId, accessRole, password } = body;

    if (!name || !email || !departmentId) {
      return apiError("name, email and departmentId are required", 400);
    }

    const member = (await Member.create({
      name,
      email: email.toLowerCase(),
      role,
      departmentId,
      accessRole: accessRole || "MEMBER",
      portalToken: Math.random().toString(36).substring(7),
    })) as any;

    return apiJson({ id: member._id.toString(), ...member.toObject() }, 201);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
