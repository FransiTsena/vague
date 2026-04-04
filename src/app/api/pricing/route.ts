import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Room, Calendar, Booking } from "@/lib/models";
import { getDynamicPricingPrediction } from "@/lib/groq";

type BookingChannel = "direct" | "ota" | "corporate" | "agent";
type MealPlan = "room_only" | "breakfast" | "half_board" | "full_board";
type LoyaltyTier = "none" | "silver" | "gold" | "platinum";
type BookingWithRoomType = {
  roomId?: { type?: string } | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function parseBoolean(value: string | null, fallback = false) {
  if (value === null) return fallback;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return fallback;
}

function getDayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getStayNights(checkIn: Date, checkOut: Date) {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getWeekendShare(checkIn: Date, checkOut: Date) {
  const current = new Date(checkIn);
  let weekendNights = 0;
  let totalNights = 0;

  while (current < checkOut) {
    const day = current.getDay();
    if (day === 5 || day === 6) {
      weekendNights += 1;
    }
    totalNights += 1;
    current.setDate(current.getDate() + 1);
  }

  if (totalNights === 0) return 0;
  return weekendNights / totalNights;
}

function getStdDev(values: number[]) {
  if (!values.length) return 0;
  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const variance =
    values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const dateStr = searchParams.get("checkIn") || searchParams.get("date"); // YYYY-MM-DD
  const checkOutStr = searchParams.get("checkOut");

  const guestCount = parsePositiveInt(searchParams.get("guests"), 2);
  const bookingChannel =
    (searchParams.get("channel") as BookingChannel | null) || "direct";
  const mealPlan =
    (searchParams.get("mealPlan") as MealPlan | null) || "room_only";
  const loyaltyTier =
    (searchParams.get("loyaltyTier") as LoyaltyTier | null) || "none";
  const isRefundable = parseBoolean(searchParams.get("refundable"), false);
  const promoCode = (searchParams.get("promoCode") || "").trim().toUpperCase();
  const specialRequests = parsePositiveInt(searchParams.get("specialRequests"), 0);

  if (!roomId || !dateStr) {
    return NextResponse.json({ error: "Missing roomId or checkIn/date" }, { status: 400 });
  }

  try {
    await dbConnect();

    const checkInDate = new Date(dateStr);
    const checkOutDate = checkOutStr
      ? new Date(checkOutStr)
      : new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: "Invalid check-in/check-out date format." }, { status: 400 });
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: "checkOut must be after checkIn." }, { status: 400 });
    }

    const stayNights = getStayNights(checkInDate, checkOutDate);
    const weekendShare = getWeekendShare(checkInDate, checkOutDate);

    let room;
    if (roomId === "demo-id") {
      room = await Room.findOne();
    } else {
      room = await Room.findById(roomId);
    }
    
    if (!room) {
      return NextResponse.json({ error: "Room not found. Please seed the database first using the /api/seed endpoint." }, { status: 404 });
    }

    const { start, end } = getDayBounds(checkInDate);

    const calendarEntry = await Calendar.findOne({
      date: {
        $gte: start,
        $lt: end,
      },
    });

    const eventMultiplier = calendarEntry?.demandMultiplier || 1;
    const isHoliday = calendarEntry?.isHoliday || false;

    const month = checkInDate.getMonth();
    const seasonalityMultiplier =
      month === 11 || month === 0
        ? 1.2
        : month >= 5 && month <= 7
          ? 1.1
          : month >= 8 && month <= 10
            ? 1.14
            : 1.03;

    const roomTypeCount = await Room.countDocuments({ type: room.type });
    const bookingsOnDate = (await Booking.find({
      checkIn: { $lte: checkInDate },
      checkOut: { $gt: checkInDate },
    })
      .populate("roomId")
      .lean()) as BookingWithRoomType[];
    const typeOccupancy = bookingsOnDate.filter((booking) => booking.roomId?.type === room.type).length;
    const occupancyRate = roomTypeCount > 0 ? typeOccupancy / roomTypeCount : 0;

    const occupancyMultiplier = clamp(0.86 + occupancyRate * 0.78, 0.86, 1.64);

    const expectedGuests = room.type === "suite" ? 4 : room.type === "deluxe" ? 3 : 2;
    const guestPressureMultiplier = clamp(0.92 + (guestCount / expectedGuests) * 0.12, 0.88, 1.25);

    const bookingChannelMultipliers: Record<BookingChannel, number> = {
      direct: 0.97,
      ota: 1.08,
      corporate: 0.93,
      agent: 1.02,
    };
    const bookingChannelMultiplier = bookingChannelMultipliers[bookingChannel] || 1;

    const mealPlanMultipliers: Record<MealPlan, number> = {
      room_only: 1,
      breakfast: 1.12,
      half_board: 1.22,
      full_board: 1.34,
    };
    const mealPlanMultiplier = mealPlanMultipliers[mealPlan] || 1;

    const loyaltyMultipliers: Record<LoyaltyTier, number> = {
      none: 1,
      silver: 0.97,
      gold: 0.93,
      platinum: 0.89,
    };
    const loyaltyMultiplier = loyaltyMultipliers[loyaltyTier] || 1;

    const refundableMultiplier = isRefundable ? 1.08 : 0.96;

    const today = new Date();
    const leadDays = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const leadTimeMultiplier =
      leadDays < 2
        ? 1.2
        : leadDays <= 7
          ? 1.11
          : leadDays <= 21
            ? 1.04
            : leadDays <= 45
              ? 0.98
              : 0.93;

    const stayLengthMultiplier =
      stayNights >= 8 ? 0.84 : stayNights >= 5 ? 0.9 : stayNights >= 3 ? 0.96 : stayNights === 2 ? 1 : 1.08;

    const weekendMultiplier = 1 + weekendShare * 0.2;

    const pricePoints = (room.priceHistory || [])
      .map((point: { price: number }) => point.price)
      .filter((value: number) => Number.isFinite(value));
    const volatilityAbs = getStdDev(pricePoints);
    const volatilityRatio = room.basePrice > 0 ? volatilityAbs / room.basePrice : 0;
    const volatilityMultiplier = clamp(1 + volatilityRatio * 0.35, 0.95, 1.2);

    const currentWindowStart = new Date(checkInDate);
    currentWindowStart.setDate(currentWindowStart.getDate() - 30);
    const previousWindowStart = new Date(checkInDate);
    previousWindowStart.setDate(previousWindowStart.getDate() - 60);

    const [currentBookings, previousBookings] = (await Promise.all([
      Booking.find({
        bookingDate: { $gte: currentWindowStart, $lt: checkInDate },
      })
        .populate("roomId")
        .lean(),
      Booking.find({
        bookingDate: { $gte: previousWindowStart, $lt: currentWindowStart },
      })
        .populate("roomId")
        .lean(),
    ])) as [BookingWithRoomType[], BookingWithRoomType[]];

    const currentTypeBookings = currentBookings.filter((booking) => booking.roomId?.type === room.type).length;
    const previousTypeBookings = previousBookings.filter((booking) => booking.roomId?.type === room.type).length;

    const demandTrendRaw = previousTypeBookings === 0 ? 1 : currentTypeBookings / previousTypeBookings;
    const demandTrendMultiplier = clamp(0.92 + demandTrendRaw * 0.1, 0.9, 1.18);

    let promoMultiplier = 1;
    if (promoCode === "EARLY10" && leadDays >= 30) promoMultiplier = 0.9;
    if (promoCode === "STAY5" && stayNights >= 5) promoMultiplier = Math.min(promoMultiplier, 0.92);
    if (promoCode === "LOYAL") promoMultiplier = Math.min(promoMultiplier, 0.95);

    const specialRequestMultiplier = clamp(1 + specialRequests * 0.015, 1, 1.12);

    const ruleMultiplier = clamp(
      occupancyMultiplier *
        eventMultiplier *
        seasonalityMultiplier *
        leadTimeMultiplier *
        stayLengthMultiplier *
        weekendMultiplier *
        guestPressureMultiplier *
        mealPlanMultiplier *
        bookingChannelMultiplier *
        loyaltyMultiplier *
        refundableMultiplier *
        demandTrendMultiplier *
        volatilityMultiplier *
        promoMultiplier *
        specialRequestMultiplier,
      0.7,
      2.2,
    );

    const aiResponse = await getDynamicPricingPrediction({
      roomType: room.type,
      basePrice: room.basePrice,
      roomStatus: room.status,
      occupancyRate,
      leadDays,
      stayNights,
      guestCount,
      weekendShare,
      bookingChannel,
      mealPlan,
      loyaltyTier,
      isRefundable,
      promoCode: promoCode || "NONE",
      specialRequests,
      priceHistoryVolatility: round2(volatilityRatio),
      seasonalityMultiplier,
      demandTrendMultiplier,
      ruleMultiplier,
      eventDemandMultiplier: eventMultiplier,
      calendarDemandMultiplier: eventMultiplier,
      expectedGuests,
      currentTypeBookings,
      previousTypeBookings,
      referenceDate: dateStr,
      checkOut: checkOutDate.toISOString().slice(0, 10),
      isHoliday,
      event: calendarEntry?.event || "None",
    });

    let aiMultiplier = 1;
    let aiReason = "Rule-based dynamic pricing applied.";

    if (aiResponse && aiResponse.multiplier) {
      aiMultiplier = clamp(Number(aiResponse.multiplier), 0.85, 1.35);
      if (typeof aiResponse.reason === "string" && aiResponse.reason.trim()) {
        aiReason = aiResponse.reason;
      }
    }

    const dynamicMultiplier = clamp(ruleMultiplier * aiMultiplier, 0.65, 2.5);
    const dynamicPrice = round2(room.basePrice * dynamicMultiplier);
    const estimatedSubtotal = round2(dynamicPrice * stayNights);
    const taxRate = 0.15;
    const estimatedTaxes = round2(estimatedSubtotal * taxRate);
    const estimatedTotal = round2(estimatedSubtotal + estimatedTaxes);

    const factorBreakdown = {
      eventMultiplier: round2(eventMultiplier),
      occupancyRate: round2(occupancyRate),
      leadDays,
      aiMultiplier: round2(aiMultiplier),
      ruleMultiplier: round2(ruleMultiplier),
      weekendShare: round2(weekendShare),
      occupancyMultiplier: round2(occupancyMultiplier),
      guestPressureMultiplier: round2(guestPressureMultiplier),
      bookingChannelMultiplier: round2(bookingChannelMultiplier),
      mealPlanMultiplier: round2(mealPlanMultiplier),
      loyaltyMultiplier: round2(loyaltyMultiplier),
      refundableMultiplier: round2(refundableMultiplier),
      leadTimeMultiplier: round2(leadTimeMultiplier),
      stayLengthMultiplier: round2(stayLengthMultiplier),
      weekendMultiplier: round2(weekendMultiplier),
      seasonalityMultiplier: round2(seasonalityMultiplier),
      demandTrendMultiplier: round2(demandTrendMultiplier),
      volatilityMultiplier: round2(volatilityMultiplier),
      promoMultiplier: round2(promoMultiplier),
      specialRequestMultiplier: round2(specialRequestMultiplier),
      dynamicMultiplier: round2(dynamicMultiplier),
      volatilityRatio: round2(volatilityRatio),
      currentTypeBookings,
      previousTypeBookings,
      isHoliday,
      eventName: calendarEntry?.event || "None",
    };

    return NextResponse.json({
      roomId: String(room._id),
      roomType: room.type,
      roomNumber: room.roomNumber,
      basePrice: room.basePrice,
      dynamicPrice,
      estimatedSubtotal,
      estimatedTaxes,
      estimatedTotal,
      guestCount,
      stayNights,
      checkIn: checkInDate.toISOString().slice(0, 10),
      checkOut: checkOutDate.toISOString().slice(0, 10),
      aiInsight: aiReason,
      factors: factorBreakdown,
      date: checkInDate.toISOString().slice(0, 10),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown pricing error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
