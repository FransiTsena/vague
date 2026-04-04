import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking, Room } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    // Get occupancy for the next 7 days
    const days = 7;
    const occupancyData = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const totalRooms = await Room.countDocuments();
      const bookedRooms = await Booking.countDocuments({
        checkIn: { $lt: nextDay },
        checkOut: { $gt: date },
      });

      occupancyData.push({
        date: date.toISOString().split("T")[0],
        occupancy: totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0,
        booked: bookedRooms,
        total: totalRooms,
      });
    }

    return NextResponse.json(occupancyData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
