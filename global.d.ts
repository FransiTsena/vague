declare module "*.css";

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accessRole: "ADMIN" | "DEPARTMENT_HEAD" | "MEMBER";
      departmentId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    accessRole: "ADMIN" | "DEPARTMENT_HEAD" | "MEMBER";
    departmentId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessRole: "ADMIN" | "DEPARTMENT_HEAD" | "MEMBER";
    departmentId?: string | null;
  }
}

