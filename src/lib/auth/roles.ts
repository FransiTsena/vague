import type { AccessRole } from "@/lib/models";

const ROLE_ALIASES: Record<string, AccessRole> = {
  ADMIN: "ADMIN",
  SUPER_ADMIN: "ADMIN",
  OWNER: "ADMIN",

  DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
  DEPT_HEAD: "DEPARTMENT_HEAD",
  HEAD: "DEPARTMENT_HEAD",
  MANAGER: "DEPARTMENT_HEAD",

  MEMBER: "MEMBER",
  STAFF: "MEMBER",
  USER: "MEMBER",
};

export function normalizeAccessRole(value: unknown): AccessRole | null {
  if (typeof value !== "string") return null;
  const normalized = ROLE_ALIASES[value.trim().toUpperCase()];
  return normalized || null;
}

export function normalizeAccessRoleOrDefault(value: unknown, fallback: AccessRole = "MEMBER"): AccessRole {
  return normalizeAccessRole(value) || fallback;
}
