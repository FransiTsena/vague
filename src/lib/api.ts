import { NextResponse } from "next/server";

const noCache = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
} as const;

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: noCache });
}

export function apiJson<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: noCache });
}
