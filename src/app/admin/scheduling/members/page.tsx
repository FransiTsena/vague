"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, FieldLabel, Input, Select } from "@/components/ui";
import { apiFetch } from "@/lib/client-fetch";

type Department = { _id: string; name: string };
type Member = {
  _id: string;
  name: string;
  email: string;
  role: string | null;
  portalToken?: string | null;
  departmentId: { _id: string; name: string } | null;
};

export default function MembersPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.accessRole === "ADMIN";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filterDept, setFilterDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [newAccessRole, setNewAccessRole] = useState("MEMBER");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dRes = await fetch("/api/admin/staffing/departments");
      if (!dRes.ok) throw new Error("Failed to load departments");
      const list = await dRes.json();
      setDepartments(list);

      const q = filterDept ? `?departmentId=${encodeURIComponent(filterDept)}` : "";
      const mRes = await fetch(`/api/admin/staffing/members${q}`);
      if (!mRes.ok) throw new Error("Failed to load members");
      setMembers(await mRes.json());
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterDept]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0]._id);
    }
  }, [departments, departmentId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/staffing/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role: role || null,
          departmentId,
          accessRole: newAccessRole,
          password: newPassword,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? res.statusText);
      }
      setName("");
      setEmail("");
      setRole("");
      setNewPassword("");
      setNewAccessRole("MEMBER");
      await load();
    } catch (err: any) {
      setError(err.message || "An error occurred during save");
    } finally {
      setSaving(false);
    }
  }

  function scheduleUrl(token: string) {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/staff?token=${encodeURIComponent(token)}`;
  }

  async function copyScheduleLink(token: string) {
    try {
      await navigator.clipboard.writeText(scheduleUrl(token));
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  async function rotatePortalLink(id: string) {
    if (!confirm("Rotate schedule link? Old bookmarks and shared links will stop working.")) return;
    setError(null);
    const res = await apiFetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regeneratePortalToken: true }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not rotate link");
      return;
    }
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm("Remove this staff member?")) return;
    setError(null);
    const res = await apiFetch(`/api/members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Delete failed");
      return;
    }
    await load();
  }

  return (
    <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-playfair tracking-tight text-zinc-900 dark:text-zinc-50">Staff Directory</h1>
        <p className="mt-2 text-zinc-500 max-w-2xl">
          Coordinate resort personnel by department, manage access roles, and monitor individual scheduling tokens for secure portal access.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl border border-red-200/50 bg-red-50/50 px-6 py-4 text-sm text-red-800 backdrop-blur-sm dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Right side management - Moved to left for better flow */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-r border-zinc-200 dark:border-zinc-800 pr-0 lg:pr-12">
          <h2 className="text-lg font-bold font-playfair mb-6 flex items-center gap-2">
            <span className="block w-2 h-2 rounded-full bg-teal-500" />
            Registration
          </h2>
          <form onSubmit={onCreate} className="space-y-5">
            <div>
              <FieldLabel htmlFor="m-name">Display Name</FieldLabel>
              <Input
                id="m-name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
                placeholder="Full name"
                className="bg-zinc-50/50"
              />
            </div>
            <div>
              <FieldLabel htmlFor="m-email">Work Email</FieldLabel>
              <Input
                id="m-email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                placeholder="email@vagueresort.com"
                className="bg-zinc-50/50"
              />
            </div>
            <div>
              <FieldLabel htmlFor="m-role">Job Title</FieldLabel>
              <Input
                id="m-role"
                value={role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
                placeholder="e.g. Executive Chef"
                className="bg-zinc-50/50"
              />
            </div>
            <div>
              <FieldLabel htmlFor="m-dept">Department</FieldLabel>
              <Select
                id="m-dept"
                value={departmentId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartmentId(e.target.value)}
                required
                className="bg-zinc-50/50"
              >
                <option value="">Choose department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
            {isAdmin && (
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-inner space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Restricted Access Control</h3>
                <div>
                  <FieldLabel htmlFor="m-access">System Role</FieldLabel>
                  <Select
                    id="m-access"
                    value={newAccessRole}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewAccessRole(e.target.value)}
                  >
                    <option value="MEMBER">Default Staff Member</option>
                    <option value="DEPARTMENT_HEAD">Department Head</option>
                    <option value="ADMIN">System Administrator</option>
                  </Select>
                </div>
                <div>
                  <FieldLabel htmlFor="m-pw">Portal Password</FieldLabel>
                  <Input
                    id="m-pw"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>
            )}
            <Button 
                type="submit" 
                disabled={saving || departments.length === 0}
                className="w-full h-12 rounded-full uppercase tracking-widest text-xs font-bold"
            >
              {saving ? "Processing…" : "Register Member"}
            </Button>
          </form>
        </div>

        {/* List side */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold font-playfair tracking-tight">Personnel Directory</h2>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Filter</span>
              <Select
                id="filter-dept"
                value={filterDept}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterDept(e.target.value)}
                className="min-w-[180px] h-10 py-1 bg-transparent border-zinc-200 dark:border-zinc-800"
              >
                <option value="">All Regions</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <section>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-zinc-300 dark:border-zinc-600 mb-4" />
                <p className="text-xs uppercase tracking-widest">Updating assets...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 font-medium">No personnel discovered in this sector.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {members.map((m) => (
                  <div
                    key={m._id}
                    className="group relative flex flex-col gap-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:flex-row sm:items-center sm:justify-between transition-all hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100 font-playfair">{m.name}</p>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                          {m.departmentId?.name ?? "Floating"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-medium">
                        {m.role || "Resort Member"} · <span className="lowercase">{m.email}</span>
                      </p>
                      <div className="mt-3 overflow-hidden h-0 group-hover:h-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                         <p className="font-mono text-[10px] text-zinc-400">Internal Reference: {m._id}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        disabled={!m.portalToken}
                        onClick={() => void copyScheduleLink(m.portalToken ?? "")}
                        className="h-10 px-4 text-[10px] uppercase font-bold tracking-widest border border-zinc-200 dark:border-zinc-800 rounded-full bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        Portal link
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => void rotatePortalLink(m._id)}
                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800"
                        title="Rotate Token"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </Button>
                      <Button 
                        variant="danger" 
                        onClick={() => void onDelete(m._id)}
                        className="h-10 px-4 text-[10px] uppercase font-bold tracking-widest rounded-full bg-red-500 text-white"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
