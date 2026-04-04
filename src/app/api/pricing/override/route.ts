import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PricingControl } from "@/lib/models";

const GLOBAL_KEY = "global";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export async function GET() {
  try {
    await dbConnect();

    const control = await PricingControl.findOne({ key: GLOBAL_KEY }).lean();

    return NextResponse.json({
      key: GLOBAL_KEY,
      aiMultiplier: control?.aiMultiplier ?? 1,
      isActive: control?.isActive ?? false,
      updatedAt: control?.updatedAt ?? null,
      updatedBy: control?.updatedBy ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown override read error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      aiMultiplier?: number;
      isActive?: boolean;
      updatedBy?: string;
    };

    if (typeof body.aiMultiplier !== "number" || Number.isNaN(body.aiMultiplier)) {
      return NextResponse.json({ error: "aiMultiplier must be a number" }, { status: 400 });
    }

    const clampedMultiplier = clamp(body.aiMultiplier, 0.5, 2);

    await dbConnect();

    const control = await PricingControl.findOneAndUpdate(
      { key: GLOBAL_KEY },
      {
        $set: {
          aiMultiplier: clampedMultiplier,
          isActive: body.isActive ?? true,
          updatedBy: body.updatedBy || "manager-ui",
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      key: GLOBAL_KEY,
      aiMultiplier: control?.aiMultiplier ?? clampedMultiplier,
      isActive: control?.isActive ?? true,
      updatedAt: control?.updatedAt ?? null,
      updatedBy: control?.updatedBy ?? "manager-ui",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown override write error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
