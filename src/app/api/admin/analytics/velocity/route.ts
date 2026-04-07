import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();
    
    // In a production scenario, we would calculate 
    // rolling averages and lead times here.
    // For now, we'll return the raw data summary 
    // so the component can be tested.
    
    const count = await Booking.countDocuments();
    const last24h = await Booking.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return NextResponse.json({
      totalBookings: count,
      velocity24h: last24h,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
