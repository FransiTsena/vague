import { NextResponse } from "next/server";
import { seedStaff } from "@/lib/scheduling/seed";

export async function POST() {
  try {
    const result = await seedStaff();
    return NextResponse.json({ message: "Seed successful", ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
