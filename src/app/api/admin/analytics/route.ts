import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    occupancy: 78,
    revenue: 1200000,
    aiNote: "Property operating within normal parameters. High volume expected for next 48h based on local event correlations.",
    segments: [
      { name: "Room Service Yield", growth: "+12%", status: "Optimized", trendUp: true },
      { name: "Direct Booking Ratio", growth: "+24%", status: "Expanding", trendUp: true },
      { name: "Spa Enrollment", growth: "-4%", status: "Underperforming", trendUp: false },
      { name: "Guest Retention", growth: "+8%", status: "Stable", trendUp: true }
    ]
  });
}
