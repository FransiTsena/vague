import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Room } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const rooms = await Room.find({ status: "available" }).lean();
    return NextResponse.json(rooms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
