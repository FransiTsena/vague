import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.accessRole) {
    redirect("/login?callbackUrl=/");
  }
  if (session.user.accessRole === "MEMBER") {
    redirect("/me");
  }

  return (
    <DashboardShell accessRole={session.user.accessRole} userName={session.user.name ?? session.user.email ?? "User"}>
      {children}
    </DashboardShell>
  );
}
