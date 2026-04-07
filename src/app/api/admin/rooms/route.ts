import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Room } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();
    const rooms = await Room.find({}).sort({ roomNumber: 1 });
    return NextResponse.json(rooms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();
    const room = await Room.create(body);
    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
