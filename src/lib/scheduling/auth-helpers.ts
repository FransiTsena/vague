import { Member, AccessRole } from "@/lib/models";
import { getServerSession } from "next-auth";
// Import your auth options from where they are defined.
// Using centralized auth-options.ts to avoid circular deps or route import issues.
import { authOptions } from "@/lib/auth/auth-options";
import { normalizeAccessRole } from "@/lib/auth/roles";
import dbConnect from "@/lib/mongodb";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const sessionUser = session.user as any;
  let accessRole = normalizeAccessRole(sessionUser.accessRole || sessionUser.role);
  let departmentId = sessionUser.departmentId ? String(sessionUser.departmentId) : undefined;

  if (!accessRole && sessionUser.email) {
    await dbConnect();
    const member = await Member.findOne({ email: String(sessionUser.email).toLowerCase() })
      .select("_id email accessRole departmentId")
      .lean();

    if (!member) return null;
    accessRole = normalizeAccessRole((member as any).accessRole);
    departmentId = (member as any).departmentId ? String((member as any).departmentId) : undefined;
  }

  if (!accessRole) return null;

  return {
    id: String(sessionUser.id || ""),
    email: String(sessionUser.email || ""),
    accessRole,
    departmentId,
  } as { id: string; email: string; accessRole: AccessRole; departmentId?: string };
}

export async function requireUser(roles?: AccessRole[]) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (roles && !roles.includes(user.accessRole)) throw new Error("Forbidden");
  return user;
}
