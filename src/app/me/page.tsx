import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaffingCalendar } from "@/components/StaffingCalendar";
import dbConnect from "@/lib/mongodb";
import { Member, StaffAssignment, ScheduleEvent, DepartmentModel } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function MeSchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/me");

  await dbConnect();

  const member = await Member.findById(session.user.id)
    .populate({ path: 'departmentId', model: DepartmentModel })
    .lean();

  if (!member) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Profile not found.</p>
      </div>
    );
  }

  const now = new Date();
  
  // Manual population for MongoDB
  const rawAssignments = await StaffAssignment.find({ memberId: member._id })
    .sort({ startsAt: -1 })
    .limit(200)
    .lean();
  
  const assignments = await Promise.all(rawAssignments.map(async (asgn: any) => {
    const dept = await DepartmentModel.findById(asgn.departmentId).lean();
    return { ...asgn, department: dept || { name: 'Unknown' } };
  }));

  const deptEvents = member.departmentId
    ? await ScheduleEvent.find({ departmentId: (member.departmentId as any)._id })
        .sort({ startsAt: 1 })
        .limit(200)
        .lean()
    : [];

  const upcoming = assignments.filter((a: any) => new Date(a.endsAt) >= now).sort((a: any, b: any) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const history = assignments.filter((a: any) => new Date(a.endsAt) < now);

  const calendarItems: any[] = [
    ...deptEvents.map((e: any) => ({
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt.toISOString(),
      title: e.title,
    })),
    ...assignments.map((a: any) => ({
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt.toISOString(),
      title: a.department.name,
    })),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-zinc-900 dark:text-zinc-50">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {(member.departmentId as any)?.name ?? "No department"}
        {member.role ? ` · ${member.role}` : ""} · {member.email}
      </p>
      <p className="mt-4 text-xs text-zinc-500">
        Same data as the{" "}
        <Link href="/staff" className="text-teal-700 underline dark:text-teal-400">
          token link
        </Link>{" "}
        from email; this page uses your login.
      </p>

      <div className="mt-10">
        <StaffingCalendar items={calendarItems} title="My calendar (department events + your shifts)" />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Upcoming on-site
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
            No upcoming shifts.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="font-medium">{a.department.name}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {a.startsAt.toLocaleString()} → {a.endsAt.toLocaleString()}
                </p>
                {a.demand.referenceId && (
                  <p className="mt-2 font-mono text-xs text-zinc-400">ref: {a.demand.referenceId}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">No past shifts.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {history.map((a) => (
              <li key={a.id} className="bg-white px-4 py-3 dark:bg-zinc-900">
                <p className="text-sm font-medium">{a.department.name}</p>
                <p className="text-xs text-zinc-500">
                  {a.startsAt.toLocaleString()} → {a.endsAt.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
