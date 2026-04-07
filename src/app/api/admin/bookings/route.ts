import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();
    // Populate guest and room info for the table
    const bookings = await Booking.find({})
      .populate("guestId")
      .populate("roomId")
      .sort({ createdAt: -1 });
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
