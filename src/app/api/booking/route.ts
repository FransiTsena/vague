import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { Booking, Guest, Room } from "@/lib/models";

type MealPlan = "room_only" | "breakfast" | "half_board" | "full_board";
type BookingChannel = "direct" | "ota" | "corporate" | "agent";
type LoyaltyTier = "none" | "silver" | "gold" | "platinum";

interface BookingRequest {
  name: string;
  phone?: string;
  email?: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  mealPlan?: MealPlan;
  channel?: BookingChannel;
  loyaltyTier?: LoyaltyTier;
  refundable?: boolean;
  promoCode?: string;
  specialRequests?: number;
  note?: string;
  quotedNightly?: number;
  quotedTotal?: number;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function getStayNights(checkIn: Date, checkOut: Date) {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingRequest;

    if (!payload.name || !payload.roomId || !payload.checkIn || !payload.checkOut) {
      return NextResponse.json(
        { error: "Missing required fields: name, roomId, checkIn, checkOut" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(payload.roomId)) {
      return NextResponse.json({ error: "Invalid room id." }, { status: 400 });
    }

    const checkInDate = new Date(payload.checkIn);
    const checkOutDate = new Date(payload.checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime()) ||
      checkOutDate <= checkInDate
    ) {
      return NextResponse.json({ error: "Invalid stay dates." }, { status: 400 });
    }

    await dbConnect();

    const room = await Room.findById(payload.roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    const guests = Math.max(1, Math.floor(Number(payload.guests) || 1));
    const stayNights = getStayNights(checkInDate, checkOutDate);

    const fallbackNightly = Number(room.currentPrice || room.basePrice || 0);
    const quotedNightly = Number(payload.quotedNightly || 0);
    const nightlyPrice = quotedNightly > 0 ? quotedNightly : fallbackNightly;

    let totalPrice = round2(nightlyPrice * stayNights);
    const quotedTotal = Number(payload.quotedTotal || 0);
    if (quotedTotal > 0) {
      totalPrice = quotedTotal;
    }

    const guest = await Guest.create({
      name: payload.name,
      phone: payload.phone,
      email: (payload.email || `${Date.now()}@vague-resort.local`).trim().toLowerCase(),
      bookingStatus: "booked",
      checkIn: checkInDate,
      checkOut: checkOutDate,
      activities: [],
    });

    const booking = await Booking.create({
      guestId: guest._id,
      roomId: room._id,
      bookingDate: new Date(),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      pricePaid: totalPrice,
      numberOfGuests: guests,
      mealPlan: payload.mealPlan || "room_only",
      bookingChannel: payload.channel || "direct",
      loyaltyTier: payload.loyaltyTier || "none",
      isRefundable: Boolean(payload.refundable),
      promoCode: (payload.promoCode || "").trim().toUpperCase(),
      specialRequests: Math.max(0, Math.min(5, Number(payload.specialRequests || 0))),
      note: (payload.note || "").trim(),
    });

    if (room.status === "available") {
      room.status = "booked";
      await room.save();
    }

    const bookingId = String(booking._id);
    const reference = `TR-${bookingId.slice(-6).toUpperCase()}`;

    return NextResponse.json({
      message: "Booking created successfully.",
      bookingId,
      reference,
      summary: {
        guestName: guest.name,
        roomType: room.type,
        roomNumber: room.roomNumber,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        stayNights,
        guests,
        totalPrice,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown booking error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
