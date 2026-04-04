"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { AccessRole } from "@prisma/client";
import { Button } from "@/components/ui";

type NavItem = { href: string; label: string };

const adminNav: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/staffing", label: "Staffing" },
  { href: "/departments", label: "Departments" },
  { href: "/members", label: "Members" },
  { href: "/events", label: "Schedule" },
  { href: "/notifications", label: "Notifications" },
  { href: "/staff", label: "Staff portal (link)" },
];

const headNav: NavItem[] = [
  { href: "/dept-head", label: "Department home" },
  { href: "/staffing", label: "Staffing" },
  { href: "/departments", label: "Department profile" },
  { href: "/members", label: "Members" },
  { href: "/events", label: "Schedule" },
  { href: "/notifications", label: "Notifications" },
  { href: "/staff", label: "Staff portal (link)" },
];

export function DashboardShell({
  accessRole,
  userName,
  children,
}: {
  accessRole: AccessRole;
  userName: string;
  children: React.ReactNode;
}) {
  const nav = accessRole === "ADMIN" ? adminNav : headNav;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-zinc-200 bg-zinc-50 px-4 py-6 md:w-56 md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Hotel internal
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Operations hub</p>
          <p className="mt-2 text-xs text-zinc-500">
            {userName}
            <span className="ml-1 rounded bg-zinc-200 px-1.5 py-0.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {accessRole.replace(/_/g, " ")}
            </span>
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 md:flex-col md:gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 md:mt-10">
          <Link
            href="/me"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-teal-800 hover:bg-white dark:text-teal-300 dark:hover:bg-zinc-900"
          >
            My schedule (signed in)
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full justify-start !px-3"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-white px-4 py-8 md:px-10 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
