"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, FieldLabel, Input, Select } from "@/components/ui";
import { apiFetch, isAbortError } from "@/lib/client-fetch";

type Department = { id: string; name: string };
type Member = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  portalToken?: string | null;
  department: { id: string; name: string } | null;
};

export default function MembersPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.accessRole === "ADMIN";

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
      const dRes = await apiFetch("/api/departments");
      if (!dRes.ok) throw new Error("departments");
      const list: Department[] = await dRes.json();
      setDepartments(list);

      const q = filterDept ? `?departmentId=${encodeURIComponent(filterDept)}` : "";
      const mRes = await apiFetch(`/api/members${q}`);
      if (!mRes.ok) throw new Error("members");
      setMembers(await mRes.json());
    } catch (e) {
      if (isAbortError(e)) {
        setError("Request timed out. Check that PostgreSQL is running and DATABASE_URL is correct.");
      } else {
        setError("Could not load data. Run npm run db:push if the schema changed, then refresh.");
      }
    } finally {
      setLoading(false);
    }
  }, [filterDept]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  }, [departments, departmentId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role: role || null,
          departmentId,
          ...(isAdmin
            ? {
                accessRole: newAccessRole,
                ...(newPassword.length >= 8 ? { password: newPassword } : {}),
              }
            : {}),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Staff members</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Each member belongs to one department; email is used for notifications.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add member</h2>
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="m-name">Name</FieldLabel>
            <Input
              id="m-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="m-email">Email</FieldLabel>
            <Input
              id="m-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="m-role">Job title</FieldLabel>
            <Input
              id="m-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Optional (e.g. Supervisor)"
            />
          </div>
          {isAdmin && (
            <>
              <div>
                <FieldLabel htmlFor="m-access">Access role</FieldLabel>
                <Select
                  id="m-access"
                  value={newAccessRole}
                  onChange={(e) => setNewAccessRole(e.target.value)}
                >
                  <option value="MEMBER">Staff (member)</option>
                  <option value="DEPARTMENT_HEAD">Department head</option>
                  <option value="ADMIN">Administrator</option>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="m-pw">Login password (optional)</FieldLabel>
                <Input
                  id="m-pw"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars to enable sign-in"
                />
              </div>
            </>
          )}
          <div>
            <FieldLabel htmlFor="m-dept">Department</FieldLabel>
            <Select
              id="m-dept"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving || departments.length === 0}>
              {saving ? "Saving…" : "Add member"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <FieldLabel htmlFor="filter-dept">Filter by department</FieldLabel>
          <Select
            id="filter-dept"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="min-w-[200px]"
          >
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Directory</h2>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-zinc-500">No members yet.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{m.name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {m.email}
                    {m.role ? ` · ${m.role}` : ""}
                  </p>
                  <p className="text-sm text-zinc-500">{m.department?.name ?? "—"}</p>
                  <p className="mt-1 font-mono text-xs text-zinc-400">id: {m.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!m.portalToken}
                    onClick={() => void copyScheduleLink(m.portalToken ?? "")}
                  >
                    Copy schedule link
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => void rotatePortalLink(m.id)}>
                    New link
                  </Button>
                  <Button variant="danger" onClick={() => void onDelete(m.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
