"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { AccessRole } from "@/lib/models";
import { Button } from "@/components/ui";

export function MeHeader({ name, accessRole }: { name: string; accessRole: AccessRole }) {
  return (
    <header className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Staff
          </p>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{name}</p>
          <p className="text-xs text-zinc-500">{accessRole.replace(/_/g, " ")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {accessRole !== "MEMBER" && (
            <Link
              href="/"
              className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
            >
              Operations hub
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            className="!py-1 !text-sm"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
