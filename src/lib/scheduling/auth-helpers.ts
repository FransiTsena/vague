import { Member, AccessRole } from "@/lib/models";
import { getServerSession } from "next-auth";
// Import your auth options from where they are defined.
// Using centralized auth-options.ts to avoid circular deps or route import issues.
import { authOptions } from "@/lib/auth/auth-options";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user as { id: string; email: string; accessRole: AccessRole; departmentId?: string } | null;
}

export async function requireUser(roles?: AccessRole[]) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (roles && !roles.includes(user.accessRole)) throw new Error("Forbidden");
  return user;
}
