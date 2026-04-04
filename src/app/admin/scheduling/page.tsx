import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import dbConnect from "@/lib/mongodb";
import { DepartmentModel, Member, ScheduleEvent, StaffingDemand, StaffAssignment } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function SchedulingOverviewPage() {
  noStore();
  await dbConnect();

  let stats = {
    departments: 0,
    members: 0,
    events: 0,
    staffingDemands: 0,
    shiftAssignments: 0,
  };

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
      staffingDemands,
      shiftAssignments,
    };
  } catch (err) {
    console.error("Stats fetch failed", err);
  }

  // Ensure stats are plain objects for Client Components if passed down
  const plainStats = JSON.parse(JSON.stringify(stats));

  const cards = [
    { title: "Departments", value: plainStats.departments, href: "/admin/scheduling/departments" },
    { title: "Staff Members", value: plainStats.members, href: "/admin/scheduling/members" },
    { title: "Upcoming Events", value: plainStats.events, href: "/admin/scheduling/events" },
    { title: "Staffing Demands", value: plainStats.staffingDemands, href: "/admin/staffing" },
    { title: "Assigned Shifts", value: plainStats.shiftAssignments, href: "/admin/staffing" },
  ];

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold mb-4 font-playfair tracking-tight">Scheduling & Resource Management</h1>
      <p className="text-zinc-500 mb-12 max-w-2xl">Manage resort departments, staff assignments, and upcoming events throughout the property from a single dashboard.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="group flex flex-col p-8 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300">
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{card.title}</h2>
            <p className="text-4xl font-bold mt-4 text-zinc-900 dark:text-zinc-100 font-playfair">{card.value}</p>
            <div className="mt-auto pt-6 flex items-center text-xs font-medium text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors uppercase tracking-widest">
              Manage {card.title}
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="relative overflow-hidden bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-10 text-white">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold font-playfair mb-2">Live Staffing Operations</h2>
          <p className="text-zinc-400 mb-8 max-w-xl">Access real-time scheduling data, generate demand forecasts based on guest occupancy, and manage shift notifications.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/staffing" className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all text-sm uppercase tracking-widest">
              Open Live Schedule
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-zinc-700/20 blur-3xl rounded-full" />
      </div>
    </div>
  );
}
