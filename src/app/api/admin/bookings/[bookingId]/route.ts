import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking, Guest } from "@/lib/models";

export async function PATCH(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await request.json();
    await dbConnect();

    const booking = await Booking.findByIdAndUpdate(bookingId, body, { new: true });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // If booking status updated guest status as well?
    if (body.status && ["checked_in", "checked_out"].includes(body.status)) {
        await Guest.findByIdAndUpdate(booking.guestId, { bookingStatus: body.status });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    await dbConnect();
    const booking = await Booking.findById(bookingId);
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Mark room as available again
    if (booking.roomId) {
      const { Room } = await import("@/lib/models");
      await Room.findByIdAndUpdate(booking.roomId, { status: "available" });
    }

    await Booking.findByIdAndDelete(bookingId);
    return NextResponse.json({ message: "Booking cancelled/deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
