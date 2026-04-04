"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, FieldLabel, Input, Select, TextArea } from "@/components/ui";
import { apiFetch, isAbortError } from "@/lib/client-fetch";

type Department = { id: string; name: string };
type Member = { id: string; name: string; departmentId: string };
type EventRow = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  department: { id: string; name: string };
  organizer: { id: string; name: string } | null;
};

export default function EventsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);

  const organizers = allMembers.filter((m) => m.departmentId === departmentId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, mRes, eRes] = await Promise.all([
        apiFetch("/api/departments"),
        apiFetch("/api/members"),
        apiFetch("/api/events"),
      ]);
      if (!dRes.ok || !mRes.ok || !eRes.ok) throw new Error("load");
      const depts: Department[] = await dRes.json();
      const mems: Member[] = (await mRes.json()).map(
        (x: Member & { department: { id: string } }) => ({
          id: x.id,
          name: x.name,
          departmentId: x.department.id,
        }),
      );
      setDepartments(depts);
      setAllMembers(mems);
      setEvents(await eRes.json());
    } catch (e) {
      setError(
        isAbortError(e)
          ? "Request timed out. Check PostgreSQL and DATABASE_URL."
          : "Could not load schedule data. Run npm run db:push if needed.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  }, [departments, departmentId]);

  useEffect(() => {
    setOrganizerId("");
  }, [departmentId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const start = new Date(startsAt);
      const end = new Date(endsAt);
      const res = await apiFetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          departmentId,
          organizerId: organizerId || null,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? res.statusText);
      }
      setTitle("");
      setDescription("");
      setOrganizerId("");
      setStartsAt("");
      setEndsAt("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    setError(null);
    const res = await apiFetch(`/api/events/${id}`, { method: "DELETE" });
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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Schedule</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Internal events tied to a department; optional organizer from that department.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">New event</h2>
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="ev-title">Title</FieldLabel>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="ev-desc">Description</FieldLabel>
            <TextArea
              id="ev-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="ev-dept">Department</FieldLabel>
            <Select
              id="ev-dept"
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
          <div>
            <FieldLabel htmlFor="ev-org">Organizer (optional)</FieldLabel>
            <Select
              id="ev-org"
              value={organizerId}
              onChange={(e) => setOrganizerId(e.target.value)}
            >
              <option value="">—</option>
              {organizers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="ev-start">Starts</FieldLabel>
            <Input
              id="ev-start"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="ev-end">Ends</FieldLabel>
            <Input
              id="ev-end"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving || departments.length === 0}>
              {saving ? "Saving…" : "Create event"}
            </Button>
          </div>
        </form>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Upcoming & past</h2>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-zinc-500">No events yet.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{ev.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {ev.department.name}
                    {ev.organizer ? ` · ${ev.organizer.name}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {new Date(ev.startsAt).toLocaleString()} → {new Date(ev.endsAt).toLocaleString()}
                  </p>
                  {ev.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{ev.description}</p>
                  )}
                  <p className="mt-1 font-mono text-xs text-zinc-400">id: {ev.id}</p>
                </div>
                <Button variant="danger" onClick={() => void onDelete(ev.id)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
