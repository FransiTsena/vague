"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, FieldLabel, Input, TextArea } from "@/components/ui";
import { apiFetch, isAbortError } from "@/lib/client-fetch";

type Department = {
  id: string;
  name: string;
  description: string | null;
  _count?: { members: number; events: number };
};

export default function DepartmentsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.accessRole === "ADMIN";

  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/departments");
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e) {
      setError(
        isAbortError(e)
          ? "Request timed out. Check PostgreSQL and DATABASE_URL."
          : "Could not load departments. Run npm run db:push if needed.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? res.statusText);
      }
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this department and all its members (cascade)?")) return;
    setError(null);
    const res = await apiFetch(`/api/departments/${id}`, { method: "DELETE" });
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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Departments</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Hotel departments; each has its own staff list and schedule.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      {isAdmin && (
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">New department</h2>
          <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <FieldLabel htmlFor="dept-name">Name</FieldLabel>
              <Input
                id="dept-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Housekeeping"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="dept-desc">Description</FieldLabel>
              <TextArea
                id="dept-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional details"
              />
            </div>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create department"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          All departments
        </h2>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500">No departments yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{d.name}</p>
                  {d.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{d.description}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    {d._count?.members ?? 0} members · {d._count?.events ?? 0} events
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-400">id: {d.id}</p>
                </div>
                {isAdmin && (
                  <Button variant="danger" onClick={() => void onDelete(d.id)}>
                    Delete
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
