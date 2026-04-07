import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Room } from "@/lib/models";

export async function PATCH(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    const body = await request.json();
    await dbConnect();
    const room = await Room.findByIdAndUpdate(roomId, body, { new: true });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    await dbConnect();
    const room = await Room.findByIdAndDelete(roomId);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
