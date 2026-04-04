import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking, Calendar, PricingControl, Room } from "@/lib/models";

const GLOBAL_KEY = "global";
const MIN_DYNAMIC_MULTIPLIER = 0.75;
const MAX_DYNAMIC_MULTIPLIER = 2.5;

type BookingWithRoomType = {
  roomId?: { type?: string } | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function getDayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getSeasonalityMultiplier(date: Date) {
  const month = date.getMonth();
  if (month === 11 || month === 0) return 1.2;
  if (month >= 5 && month <= 7) return 1.1;
  if (month >= 8 && month <= 10) return 1.14;
  return 1.03;
}

function getLeadTimeMultiplier(checkInDate: Date) {
  const today = new Date();
  const leadDays = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (leadDays < 2) return 1.2;
  if (leadDays <= 7) return 1.11;
  if (leadDays <= 21) return 1.04;
  if (leadDays <= 45) return 0.98;
  return 0.93;
}

async function applyCommittedRoomPricing(date: Date, aiMultiplier: number) {
  const [rooms, calendarEntry] = await Promise.all([
    Room.find({}, { _id: 1, type: 1, basePrice: 1, currentPrice: 1 }).lean(),
    (async () => {
      const { start, end } = getDayBounds(date);
      return Calendar.findOne({ date: { $gte: start, $lt: end } }).lean();
    })(),
  ]);

  if (!rooms.length) {
    return { updatedRooms: 0, updatedTypes: [] as string[] };
  }

  const bookingsOnDate = (await Booking.find({
    checkIn: { $lte: date },
    checkOut: { $gt: date },
  })
    .populate("roomId")
    .lean()) as BookingWithRoomType[];

  const eventMultiplier = calendarEntry?.demandMultiplier || 1;
  const seasonalityMultiplier = getSeasonalityMultiplier(date);
  const leadTimeMultiplier = getLeadTimeMultiplier(date);

  const roomsByType = new Map<string, { count: number; booked: number; multiplier: number }>();

  for (const room of rooms) {
    if (!roomsByType.has(room.type)) {
      roomsByType.set(room.type, { count: 0, booked: 0, multiplier: 1 });
    }
    roomsByType.get(room.type)!.count += 1;
  }

  for (const booking of bookingsOnDate) {
    const roomType = booking.roomId?.type;
    if (!roomType || !roomsByType.has(roomType)) continue;
    roomsByType.get(roomType)!.booked += 1;
  }

  for (const [type, stats] of roomsByType.entries()) {
    const occupancyRate = stats.count > 0 ? stats.booked / stats.count : 0;
    const occupancyMultiplier = clamp(0.86 + occupancyRate * 0.78, 0.86, 1.64);
    const ruleMultiplier = clamp(
      occupancyMultiplier * eventMultiplier * seasonalityMultiplier * leadTimeMultiplier,
      0.7,
      2.2,
    );
    const dynamicMultiplier = clamp(
      ruleMultiplier * aiMultiplier,
      MIN_DYNAMIC_MULTIPLIER,
      MAX_DYNAMIC_MULTIPLIER,
    );
    stats.multiplier = round2(dynamicMultiplier);
    roomsByType.set(type, stats);
  }

  const now = new Date();
  const roomUpdates = rooms
    .map((room) => {
      const typeStats = roomsByType.get(room.type);
      if (!typeStats) return null;
      const nextPrice = round2(room.basePrice * typeStats.multiplier);
      if (round2(room.currentPrice || 0) === nextPrice) return null;

      return {
        updateOne: {
          filter: { _id: room._id },
          update: {
            $set: { currentPrice: nextPrice },
            $push: { priceHistory: { date: now, price: nextPrice } },
          },
        },
      };
    })
    .filter(Boolean) as any[];

  if (roomUpdates.length > 0) {
    await Room.bulkWrite(roomUpdates);
  }

  return {
    updatedRooms: roomUpdates.length,
    updatedTypes: Array.from(roomsByType.keys()),
  };
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
      effectiveDate?: string;
    };

    if (typeof body.aiMultiplier !== "number" || Number.isNaN(body.aiMultiplier)) {
      return NextResponse.json({ error: "aiMultiplier must be a number" }, { status: 400 });
    }

    const clampedMultiplier = clamp(body.aiMultiplier, 0.5, 2);
    const effectiveDate = body.effectiveDate ? new Date(body.effectiveDate) : new Date();

    if (Number.isNaN(effectiveDate.getTime())) {
      return NextResponse.json({ error: "effectiveDate must be a valid date" }, { status: 400 });
    }

    await dbConnect();

    const pricingWriteResult = await applyCommittedRoomPricing(effectiveDate, clampedMultiplier);

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
      effectiveDate: effectiveDate.toISOString().slice(0, 10),
      updatedRooms: pricingWriteResult.updatedRooms,
      updatedTypes: pricingWriteResult.updatedTypes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown override write error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
