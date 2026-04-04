"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, FieldLabel, Input, Select, TextArea } from "@/components/ui";
import { apiFetch, isAbortError } from "@/lib/client-fetch";

type Department = { id: string; name: string };
type Member = { id: string; name: string; email: string; department: { name: string } };
type NotificationRow = {
  id: string;
  subject: string;
  body: string;
  status: string;
  createdAt: string;
  member: { name: string; email: string; department: { name: string } };
};

export default function NotificationsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<NotificationRow[]>([]);
  const [target, setTarget] = useState<"member" | "department">("department");
  const [departmentId, setDepartmentId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, mRes, nRes] = await Promise.all([
        apiFetch("/api/departments"),
        apiFetch("/api/members"),
        apiFetch("/api/notifications?limit=100"),
      ]);
      if (!dRes.ok || !mRes.ok || !nRes.ok) throw new Error("load");
      setDepartments(await dRes.json());
      setMembers(await mRes.json());
      setLogs(await nRes.json());
    } catch (e) {
      setError(
        isAbortError(e)
          ? "Request timed out. Check PostgreSQL and DATABASE_URL."
          : "Could not load notifications data. Run npm run db:push if needed.",
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
    if (members.length > 0 && !memberId) {
      setMemberId(members[0].id);
    }
  }, [members, memberId]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const payload =
        target === "member"
          ? { subject, body, memberId }
          : { subject, body, departmentId };
      const res = await apiFetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? res.statusText);
      }
      const data = await res.json();
      setSuccess(`Queued ${data.count} notification(s). Check status below.`);
      setSubject("");
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Notifications</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Email staff by person or whole department. Without SMTP env vars, messages are logged as{" "}
          <span className="font-medium">SKIPPED</span> (audit trail only).
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          {success}
        </p>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Send message</h2>
        <form onSubmit={onSend} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="target"
                checked={target === "department"}
                onChange={() => setTarget("department")}
              />
              Entire department
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="target"
                checked={target === "member"}
                onChange={() => setTarget("member")}
              />
              Single member
            </label>
          </div>

          {target === "department" ? (
            <div>
              <FieldLabel htmlFor="n-dept">Department</FieldLabel>
              <Select
                id="n-dept"
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
          ) : (
            <div>
              <FieldLabel htmlFor="n-member">Member</FieldLabel>
              <Select
                id="n-member"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.department?.name ?? "-"})
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <FieldLabel htmlFor="n-subject">Subject</FieldLabel>
            <Input
              id="n-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="n-body">Body</FieldLabel>
            <TextArea
              id="n-body"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={
              sending ||
              (target === "department" && departments.length === 0) ||
              (target === "member" && members.length === 0)
            }
          >
            {sending ? "Sending…" : "Send notification"}
          </Button>
        </form>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">History</h2>
          <Button type="button" variant="ghost" className="!py-1 !text-xs" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-zinc-500">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{n.subject}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      n.status === "SENT"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        : n.status === "FAILED"
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {n.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {n.member.name} · {n.member.department?.name ?? "-"} · {n.member.email}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{n.body}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
