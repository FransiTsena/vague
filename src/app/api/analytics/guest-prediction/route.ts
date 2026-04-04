import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Guest } from "@/lib/models";
import { predictGuestSegment } from "@/lib/groq";

export async function GET() {
  try {
    await dbConnect();

    // AI Prediction Mock for Guest Segments based on activity history
    const guests = await Guest.find().limit(5);
    
    if (guests.length === 0) {
      return NextResponse.json({ error: "No guest data available. Seed the database first." }, { status: 404 });
    }

    // --- Optimization: Limit the frequency of AI calls by only predicting segments for specific guests if they don't have one ---
    const segments = await Promise.all(guests.map(async (guest) => {
        const activities = guest.activities || [];
        const totalSpend = activities.reduce((sum, a: any) => sum + (a.amount || 0), 0);
        
        // --- Call Groq prediction for each guest ---
        // The getDynamicPricingPrediction now has an internal cache, so repeat calls for the same guest data are free.
        const prediction = await predictGuestSegment({
            guestId: guest._id.toString(), // Add ID to context for better caching
            activities: activities.map((a: any) => a.type),
            totalStayValue: totalSpend,
        });

        return {
            id: guest._id,
            name: guest.name,
            predictedSegment: prediction?.segment || "General",
            totalSpend: Math.round(totalSpend),
            loyaltyScore: prediction?.loyaltyScore || Math.min(100, Math.floor(totalSpend / 10)),
            insight: prediction?.insight || "Standard guest profile."
        };
    }));

    return NextResponse.json(segments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
