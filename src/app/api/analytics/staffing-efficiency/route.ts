import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking, Room, StaffAssignment } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    // Get staff load vs occupancy for next 7 days
    const days = 7;
    const analytics = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const totalRooms = await Room.countDocuments();
      const bookedRooms = await Booking.countDocuments({
        checkIn: { $lt: nextDay },
        checkOut: { $gt: date },
      });

      const staffAssigned = await StaffAssignment.countDocuments({
        startsAt: { $lt: nextDay },
        endsAt: { $gt: date },
      });

      analytics.push({
        date: date.toISOString().split("T")[0],
        occupancy: totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0,
        staffCount: staffAssigned,
        ratio: staffAssigned > 0 ? (bookedRooms / staffAssigned).toFixed(2) : bookedRooms,
        isUnderstaffed: (bookedRooms / (staffAssigned || 1)) > 5, // AI hint: more than 5 rooms per staff
      });
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
