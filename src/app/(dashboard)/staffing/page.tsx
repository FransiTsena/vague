import { unstable_noStore as noStore } from "next/cache";
import dbConnect from "@/lib/mongodb";
import { StaffingDemand, StaffingRequirement, DepartmentModel, StaffAssignment } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function StaffingPage() {
  noStore();
  await dbConnect();

  let demands: any[] = [];
  let loadError: string | null = null;
  try {
    // Fetch demands and manually populate requirements and assignments since they are separate collections in MongoDB
    const rawDemands = await StaffingDemand.find({})
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    demands = await Promise.all(rawDemands.map(async (demand: any) => {
      const requirements = await StaffingRequirement.find({ demandId: demand._id })
        .populate({ path: 'departmentId', model: DepartmentModel })
        .lean();
      
      const assignments = await StaffAssignment.find({ demandId: demand._id }).lean();

      return {
        ...demand,
        id: demand._id.toString(),
        requirements: requirements.map((req: any) => ({
          ...req,
          department: req.departmentId ? { name: req.departmentId.name } : { name: 'Unknown' }
        })),
        assignments: assignments.map((asgn: any) => ({ id: asgn._id.toString() }))
      };
    }));
  } catch (err: any) {
    loadError = `Could not read staffing data: ${err.message}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Staffing demands</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Demands are created when analytics calls{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">POST /api/v1/staffing-demands</code>{" "}
          with the service API key. While signed in here, you can also use{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">GET /api/v1/staffing-demands</code>{" "}
          (same browser session).
        </p>
      </div>

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {loadError}
        </p>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/30">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Command center (service)</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            Header:{" "}
            <code className="rounded bg-white px-1 dark:bg-zinc-950">
              Authorization: Bearer $COMMAND_CENTER_API_KEY
            </code>
          </li>
          <li>
            Optional <code className="rounded bg-white px-1 dark:bg-zinc-950">referenceId</code> for idempotent replays
            (HTTP 200 on duplicate).
          </li>
        </ul>
      </section>

      {!loadError && demands.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/30 px-4 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No staffing demands yet</p>
          <p className="mt-2 text-sm text-zinc-500">
            When guest forecasts arrive, the command center POSTs requirements here and staff receive assignments +
            email (if SMTP is configured).
          </p>
        </div>
      ) : !loadError ? (
        <ul className="space-y-3">
          {demands.map((d) => (
            <li
              key={d.id}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    d.status === "SCHEDULED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                  }`}
                >
                  {d.status}
                </span>
                <span className="font-mono text-xs text-zinc-400">{d.id}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {d.startsAt.toLocaleString()} → {d.endsAt.toLocaleString()}
              </p>
              {d.referenceId && (
                <p className="mt-1 font-mono text-xs text-zinc-500">ref: {d.referenceId}</p>
              )}
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {d.assignments.length} assignment(s) ·{" "}
                {d.requirements
                  .map((r) => `${r.department.name}: ${r.requiredCount} requested`)
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
