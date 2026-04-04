import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import { DepartmentModel, Member, ScheduleEvent, StaffingDemand, StaffAssignment } from "@/lib/models";

export const dynamic = "force-dynamic";

type RecentRow = {
  id: string;
  subject: string;
  status: string;
  member: {
    name: string;
    email: string;
    department: { name: string } | null;
  };
};

export default async function OverviewPage() {
  const session = await auth();
  if (session?.user?.accessRole === "DEPARTMENT_HEAD") {
    redirect("/dept-head");
  }

  noStore();
  await dbConnect();

  let stats: {
    departments: number;
    members: number;
    events: number;
    notifications: number;
    staffingDemands: number;
    shiftAssignments: number;
  } | null = null;
  let recent: RecentRow[] = [];

  try {
    const [departments, members, events, staffingDemands, shiftAssignments] = await Promise.all([
      DepartmentModel.countDocuments(),
      Member.countDocuments(),
      ScheduleEvent.countDocuments(),
      StaffingDemand.countDocuments(),
      StaffAssignment.countDocuments(),
    ]);

    stats = {
      departments,
      members,
      events,
      notifications: 0,
      staffingDemands,
      shiftAssignments,
    };
    recent = []; // NotificationLog not in Mongo models yet
  } catch (err: any) {
    console.error("Stats fetch error:", err);
    stats = null;
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <h1 className="text-xl font-semibold">Database not connected</h1>
        <p className="mt-2 text-sm leading-relaxed">
          Copy <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900/60">.env.example</code> to{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900/60">.env</code>, set{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900/60">DATABASE_URL</code> for PostgreSQL,
          then run{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900/60">npm run db:push</code> and{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900/60">npm run db:seed</code>.
        </p>
      </div>
    );
  }

  const cards = [
    { label: "Staffing demands", value: stats.staffingDemands, href: "/staffing" },
    { label: "On-site assignments", value: stats.shiftAssignments, href: "/staffing" },
    { label: "Departments", value: stats.departments, href: "/departments" },
    { label: "Staff members", value: stats.members, href: "/members" },
    { label: "Scheduled events", value: stats.events, href: "/events" },
    { label: "Notifications sent", value: stats.notifications, href: "/notifications" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Overview
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Command-center staffing, departments, events, and staff notifications.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label}>
            <Link
              href={c.href}
              className="block rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{c.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {c.value}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Recent notifications
          </h2>
          <Link
            href="/notifications"
            className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
          >
            Manage →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
            No notifications yet. Send one from the Notifications page.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {recent.map((n) => (
              <li
                key={n.id}
                className="flex flex-col gap-1 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-950"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{n.subject}</p>
                  <p className="text-sm text-zinc-500">
                    {n.member.name} · {n.member.department?.name ?? "—"} · {n.member.email}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    n.status === "SENT"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : n.status === "FAILED"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {n.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
