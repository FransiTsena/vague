import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking, Calendar, PricingControl, Room } from "@/lib/models";

type RoomType = "standard" | "deluxe" | "suite";
type BookingWithRoomType = {
  roomId?: { type?: string } | null;
};

const MIN_DYNAMIC_MULTIPLIER = 0.75;
const MAX_DYNAMIC_MULTIPLIER = 2.5;

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  if (!dateStr) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }

  const checkInDate = new Date(dateStr);
  if (Number.isNaN(checkInDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  try {
    await dbConnect();

    const [rooms, calendarEntry, control] = await Promise.all([
      Room.find({}, { type: 1, basePrice: 1 }).lean(),
      (async () => {
        const { start, end } = getDayBounds(checkInDate);
        return Calendar.findOne({ date: { $gte: start, $lt: end } }).lean();
      })(),
      PricingControl.findOne({ key: "global" }).lean(),
    ]);

    if (!rooms.length) {
      return NextResponse.json({ error: "No rooms found. Seed database first." }, { status: 404 });
    }

    const bookingsOnDate = (await Booking.find({
      checkIn: { $lte: checkInDate },
      checkOut: { $gt: checkInDate },
    })
      .populate("roomId")
      .lean()) as BookingWithRoomType[];

    const aiMultiplier = control?.isActive ? control.aiMultiplier : 1;
    const eventMultiplier = calendarEntry?.demandMultiplier || 1;
    const seasonalityMultiplier = getSeasonalityMultiplier(checkInDate);
    const leadTimeMultiplier = getLeadTimeMultiplier(checkInDate);

    const roomTypes: RoomType[] = ["standard", "deluxe", "suite"];

    const services = roomTypes
      .map((type) => {
        const typeRooms = rooms.filter((room) => room.type === type);
        if (!typeRooms.length) return null;

        const basePriceAvg =
          typeRooms.reduce((sum, room) => sum + room.basePrice, 0) / typeRooms.length;

        const typeBookings = bookingsOnDate.filter((booking) => booking.roomId?.type === type).length;

        const occupancyRate = typeRooms.length > 0 ? typeBookings / typeRooms.length : 0;
        const occupancyMultiplier = clamp(0.86 + occupancyRate * 0.78, 0.86, 1.64);

        const ruleMultiplier = clamp(
          occupancyMultiplier * eventMultiplier * seasonalityMultiplier * leadTimeMultiplier,
          0.7,
          2.2
        );

        const dynamicMultiplier = clamp(
          ruleMultiplier * aiMultiplier,
          MIN_DYNAMIC_MULTIPLIER,
          MAX_DYNAMIC_MULTIPLIER
        );

        const dynamicPrice = round2(basePriceAvg * dynamicMultiplier);
        const difference = round2(dynamicPrice - basePriceAvg);
        const differencePercent = round2((difference / basePriceAvg) * 100);

        return {
          service: type,
          basePrice: round2(basePriceAvg),
          dynamicPrice,
          difference,
          differencePercent,
          dynamicMultiplier: round2(dynamicMultiplier),
          occupancyRate: round2(occupancyRate),
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      date: checkInDate.toISOString().slice(0, 10),
      aiMultiplier: round2(aiMultiplier),
      minPriceFloorPercent: -25,
      services,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown service pricing error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
