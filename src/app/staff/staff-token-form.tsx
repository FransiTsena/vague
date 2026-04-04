"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FieldLabel, Input } from "@/components/ui";

export function StaffTokenForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const t = token.trim();
    if (!t) {
      setErr("Paste your personal token or full schedule link.");
      return;
    }
    let value = t;
    try {
      if (t.includes("token=")) {
        const u = new URL(t, typeof window !== "undefined" ? window.location.origin : "http://localhost");
        const q = u.searchParams.get("token");
        if (q) value = q;
      }
    } catch {
      setErr("That link could not be read. Paste only the token if unsure.");
      return;
    }
    router.push(`/staff?token=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <FieldLabel htmlFor="staff-token">Personal token or schedule link</FieldLabel>
        <Input
          id="staff-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste from email or operations"
          autoComplete="off"
          className="font-mono text-xs"
        />
      </div>
      {err && (
        <p className="text-sm text-red-700 dark:text-red-300">{err}</p>
      )}
      <Button type="submit">View my schedule</Button>
    </form>
  );
}
