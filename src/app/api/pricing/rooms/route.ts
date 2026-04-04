import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Room } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    const rooms = await Room.find({}, { _id: 1, roomNumber: 1, type: 1, basePrice: 1, currentPrice: 1, status: 1, images: 1, description: 1, amenities: 1, videoUrl: 1 })
      .sort({ type: 1, roomNumber: 1 })
      .lean();

    return NextResponse.json({
      count: rooms.length,
      rooms: rooms.map((room) => ({
        id: String(room._id),
        roomNumber: room.roomNumber,
        type: room.type,
        basePrice: room.basePrice,
        currentPrice: room.currentPrice,
        status: room.status,
        images: room.images || [],
        videoUrl: room.videoUrl || null,
        description: room.description || "",
        amenities: room.amenities || [],
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown room lookup error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
