import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { Booking } from "@/lib/models";

interface Params {
  params: Promise<{ bookingId: string }>;
}

export async function GET(_: Request, context: Params) {
  try {
    const { bookingId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
    }

    await dbConnect();

    const booking = await Booking.findById(bookingId)
      .populate("roomId", "roomNumber type")
      .populate("guestId", "name phone email")
      .lean();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown booking lookup error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
