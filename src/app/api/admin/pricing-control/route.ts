import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PricingControl } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();
    let control = await PricingControl.findOne({ key: "global" });
    
    if (!control) {
      control = await PricingControl.create({
        key: "global",
        aiMultiplier: 1,
        isActive: true,
        updatedBy: "System"
      });
    }

    return NextResponse.json(control);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { aiMultiplier, isActive } = body;

    const control = await PricingControl.findOneAndUpdate(
      { key: "global" },
      { 
        aiMultiplier: aiMultiplier ?? 1, 
        isActive: isActive ?? true,
        updatedBy: "Admin" 
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(control);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
