import dbConnect from "@/lib/mongodb";
import { Member, StaffAssignment, DepartmentModel, StaffingDemand } from "@/lib/models";
import { StaffTokenForm } from "./staff-token-form";

export const metadata: Metadata = {
  title: "My schedule — staff",
  description: "Your on-site shifts and history.",
};

export const dynamic = "force-dynamic";

export default async function StaffSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token: raw } = await searchParams;
  const token = raw?.trim();

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">My schedule</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Use the link from your assignment email, or paste your personal token below. Do not share your
            token with others.
          </p>
          <StaffTokenForm />
          <details className="mt-8 text-xs text-zinc-500">
            <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">
              For apps and integrations
            </summary>
            <p className="mt-2 font-mono">
              GET /api/v1/me/schedule?token=&lt;your-token&gt;
            </p>
          </details>
        </div>
      </div>
    );
  }

  await dbConnect();

  const member = await Member.findOne({ portalToken: token })
    .populate({ path: 'departmentId', model: DepartmentModel })
    .lean();

  if (!member) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950/40">
          <h1 className="text-xl font-semibold text-red-900 dark:text-red-100">Link not valid</h1>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            This schedule link is invalid or has been rotated. Request a new link from operations.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const rawAssignments = await StaffAssignment.find({ memberId: member._id })
    .sort({ startsAt: -1 })
    .limit(200)
    .lean();

  const rows = await Promise.all(rawAssignments.map(async (asgn: any) => {
    const dept = await DepartmentModel.findById(asgn.departmentId).lean();
    const demand = await StaffingDemand.findById(asgn.demandId).lean();
    return {
      ...asgn,
      id: asgn._id.toString(),
      department: dept || { name: 'Unknown' },
      demand: demand || { referenceId: null, status: 'Unknown' }
    };
  }));

  const upcoming = rows.filter((a: any) => new Date(a.endsAt) >= now).sort((a: any, b: any) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const history = rows.filter((a: any) => new Date(a.endsAt) < now);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Staff portal
          </p>
          <h1 className="mt-1 text-2xl font-semibold">{member.name}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {(member.departmentId as any)?.name ?? "—"}
            {member.role ? ` · ${member.role}` : ""} · {member.email}
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Upcoming on-site
          </h2>
          {upcoming.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
              No upcoming shifts. You will be notified when the command center schedules you.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a: any) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{a.department.name}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(a.startsAt).toLocaleString()} → {new Date(a.endsAt).toLocaleString()}
                  </p>
                  {a.demand?.referenceId && (
                    <p className="mt-2 font-mono text-xs text-zinc-400">
                      ref: {a.demand.referenceId} · {a.demand.status}
                    </p>
                  )}
                  {a.notifiedAt && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Notified {new Date(a.notifiedAt).toLocaleString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500">No past shifts recorded yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {history.map((a: any) => (
                <li key={a.id} className="bg-white px-4 py-3 dark:bg-zinc-900">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{a.department.name}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(a.startsAt).toLocaleString()} → {new Date(a.endsAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-12 text-center text-xs text-zinc-400">
          <Link href="/" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">
            Operations hub
          </Link>
        </p>
      </div>
    </div>
  );
}
