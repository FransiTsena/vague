"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { BedDouble, CalendarDays, Wallet, BadgePercent, Loader2 } from "lucide-react";

const WHATSAPP_NUMBER = "251929945151";

type RoomType = "standard" | "deluxe" | "suite";
type BookingChannel = "direct" | "ota" | "corporate" | "agent";
type MealPlan = "room_only" | "breakfast" | "half_board" | "full_board";
type LoyaltyTier = "none" | "silver" | "gold" | "platinum";

interface RoomOption {
  id: string;
  roomNumber: string;
  type: RoomType;
  basePrice: number;
  currentPrice: number;
  status: "available" | "booked" | "occupied";
}

interface PricingQuote {
  roomId: string;
  roomType: RoomType;
  roomNumber: string;
  basePrice: number;
  dynamicPrice: number;
  estimatedSubtotal: number;
  estimatedTaxes: number;
  estimatedTotal: number;
  guestCount: number;
  stayNights: number;
  checkIn: string;
  checkOut: string;
  aiInsight: string;
  factors: Record<string, number | string | boolean>;
}

interface RoomsResponse {
  count: number;
  rooms: RoomOption[];
  error?: string;
}

interface PricingResponse extends PricingQuote {
  error?: string;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function roomTypeLabel(type: RoomType) {
  if (type === "suite") return "Suite";
  if (type === "deluxe") return "Deluxe";
  return "Standard";
}

export default function StayRegistration() {
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const defaultCheckIn = toDateInputValue(addDays(new Date(), 7));
  const defaultCheckOut = toDateInputValue(addDays(new Date(), 9));

  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    roomId: "",
    checkIn: defaultCheckIn,
    checkOut: defaultCheckOut,
    guests: 2,
    mealPlan: "breakfast" as MealPlan,
    channel: "direct" as BookingChannel,
    loyaltyTier: "none" as LoyaltyTier,
    refundable: true,
    promoCode: "",
    specialRequests: 0,
    message: "",
  });

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === form.roomId) || null,
    [rooms, form.roomId],
  );

  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);
    setRoomsError("");
    try {
      const response = await fetch("/api/pricing/rooms", { cache: "no-store" });
      const data = (await response.json()) as RoomsResponse;

      if (!response.ok || data.error) {
        setRoomsError(data.error || "Unable to load rooms.");
        setRooms([]);
        return;
      }

      setRooms(data.rooms || []);
      if (!form.roomId && data.rooms.length > 0) {
        const firstAvailable = data.rooms.find((room) => room.status !== "occupied");
        setForm((prev) => ({
          ...prev,
          roomId: firstAvailable?.id || data.rooms[0].id,
        }));
      }
    } catch {
      setRoomsError("Unable to connect to room inventory. Please try again.");
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  }, [form.roomId]);

  const fetchQuote = useCallback(async () => {
    if (!form.roomId || !form.checkIn || !form.checkOut) {
      setQuote(null);
      return null;
    }

    setQuoteLoading(true);
    setQuoteError("");

    try {
      const params = new URLSearchParams({
        roomId: form.roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: String(form.guests),
        mealPlan: form.mealPlan,
        channel: form.channel,
        loyaltyTier: form.loyaltyTier,
        refundable: String(form.refundable),
        promoCode: form.promoCode.trim(),
        specialRequests: String(form.specialRequests),
      });

      const response = await fetch(`/api/pricing?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as PricingResponse;

      if (!response.ok || data.error) {
        setQuote(null);
        setQuoteError(data.error || "Unable to calculate pricing.");
        return null;
      }

      setQuote(data);
      return data;
    } catch {
      setQuote(null);
      setQuoteError("Pricing service is currently unavailable.");
      return null;
    } finally {
      setQuoteLoading(false);
    }
  }, [
    form.roomId,
    form.checkIn,
    form.checkOut,
    form.guests,
    form.mealPlan,
    form.channel,
    form.loyaltyTier,
    form.refundable,
    form.promoCode,
    form.specialRequests,
  ]);

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchQuote();
    }, 320);

    return () => clearTimeout(timeout);
  }, [fetchQuote]);

  const handleDateChange = (field: "checkIn" | "checkOut", value: string) => {
    setForm((prev) => {
      if (field === "checkIn") {
        const nextCheckIn = value;
        const currentCheckOutDate = new Date(prev.checkOut);
        const nextCheckInDate = new Date(nextCheckIn);
        if (currentCheckOutDate <= nextCheckInDate) {
          const nextCheckOut = toDateInputValue(addDays(nextCheckInDate, 1));
          return { ...prev, checkIn: nextCheckIn, checkOut: nextCheckOut };
        }
        return { ...prev, checkIn: nextCheckIn };
      }

      return { ...prev, checkOut: value };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    let activeQuote = quote;
    if (!activeQuote) {
      activeQuote = await fetchQuote();
    }

    if (!activeQuote) {
      setQuoteError("Please wait for pricing to be calculated before submitting.");
      return;
    }

    const roomLabel = selectedRoom
      ? `${roomTypeLabel(selectedRoom.type)} • Room ${selectedRoom.roomNumber}`
      : activeQuote.roomType;

    const message = `
*New Stay Registration - VAGUE Resort*
━━━━━━━━━━━━━━━━━━━━

*Guest Name:* ${form.name}
*Phone:* ${form.phone}
*Email:* ${form.email || "Not provided"}

*Stay Window:* ${form.checkIn} to ${form.checkOut} (${activeQuote.stayNights} nights)
*Guests:* ${form.guests}
*Room:* ${roomLabel}
*Meal Plan:* ${form.mealPlan}
*Booking Channel:* ${form.channel}
*Loyalty Tier:* ${form.loyaltyTier}
*Refundable:* ${form.refundable ? "Yes" : "No"}
*Promo Code:* ${form.promoCode || "None"}
*Special Requests Score:* ${form.specialRequests}

*AI Dynamic Pricing*
Base Nightly Rate: ${formatMoney(activeQuote.basePrice)}
Dynamic Nightly Rate: ${formatMoney(activeQuote.dynamicPrice)}
Subtotal: ${formatMoney(activeQuote.estimatedSubtotal)}
Taxes: ${formatMoney(activeQuote.estimatedTaxes)}
Estimated Total: ${formatMoney(activeQuote.estimatedTotal)}
Insight: ${activeQuote.aiInsight}

*Guest Notes:*
${form.message || "No additional notes."}
`.trim();

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const cardBaseClass = isDark
    ? "border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.75))]"
    : "border-black/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,245,230,0.92)_45%,rgba(250,248,242,0.86))]";

  return (
    <Section
      id="contact"
      className={isDark ? "bg-[#050505] text-white" : "bg-[#f2ede4] text-black"}
    >
      <div className="relative mx-auto max-w-6xl" lang={language}>
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-14 left-10 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-12 right-10 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>

        <div className="mb-10 text-center">
          <p className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs tracking-[0.24em] uppercase ${isDark ? "border-white/20 text-neutral-300" : "border-black/20 text-neutral-700"}`}>
            Smart Stay Registration
          </p>
          <h2 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight">
            Plan Your Stay With
            <span className={isDark ? "text-amber-300" : "text-amber-700"}> Live AI Pricing</span>
          </h2>
          <p className={`mx-auto mt-4 max-w-3xl text-base md:text-lg ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
            Select your room, stay details, and booking preferences. We price in real time using demand, occupancy,
            lead time, seasonality, loyalty, and booking behavior.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr]">
          <form onSubmit={handleSubmit} className={`rounded-3xl border p-6 md:p-8 ${cardBaseClass}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Guest Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Phone</label>
                <input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                  placeholder="+251 9XX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Check-in</label>
                <input
                  type="date"
                  required
                  value={form.checkIn}
                  onChange={(event) => handleDateChange("checkIn", event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Check-out</label>
                <input
                  type="date"
                  required
                  value={form.checkOut}
                  min={form.checkIn}
                  onChange={(event) => handleDateChange("checkOut", event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Guests</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={form.guests}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      guests: Math.max(1, Math.min(8, Number(event.target.value) || 1)),
                    }))
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Room Selection</label>
                <select
                  required
                  value={form.roomId}
                  onChange={(event) => setForm((prev) => ({ ...prev, roomId: event.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                >
                  {roomsLoading && <option>Loading rooms...</option>}
                  {!roomsLoading && rooms.length === 0 && <option>No rooms available</option>}
                  {!roomsLoading &&
                    rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {roomTypeLabel(room.type)} | Room {room.roomNumber} | Base {formatMoney(room.basePrice)} | {room.status}
                      </option>
                    ))}
                </select>
                {roomsError && <p className="text-xs text-rose-400">{roomsError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Meal Plan</label>
                <select
                  value={form.mealPlan}
                  onChange={(event) => setForm((prev) => ({ ...prev, mealPlan: event.target.value as MealPlan }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                >
                  <option value="room_only">Room Only</option>
                  <option value="breakfast">Breakfast Included</option>
                  <option value="half_board">Half Board</option>
                  <option value="full_board">Full Board</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Booking Channel</label>
                <select
                  value={form.channel}
                  onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value as BookingChannel }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                >
                  <option value="direct">Direct Website</option>
                  <option value="ota">Online Travel Agency</option>
                  <option value="corporate">Corporate Contract</option>
                  <option value="agent">Travel Agent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Loyalty Tier</label>
                <select
                  value={form.loyaltyTier}
                  onChange={(event) => setForm((prev) => ({ ...prev, loyaltyTier: event.target.value as LoyaltyTier }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                >
                  <option value="none">None</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Promo Code</label>
                <input
                  value={form.promoCode}
                  onChange={(event) => setForm((prev) => ({ ...prev, promoCode: event.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm uppercase outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                  placeholder="EARLY10"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Special Requests Intensity (0-5)</label>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={form.specialRequests}
                  onChange={(event) => setForm((prev) => ({ ...prev, specialRequests: Number(event.target.value) }))}
                  className="w-full accent-amber-500"
                />
                <p className="text-xs text-neutral-500">Current value: {form.specialRequests}</p>
              </div>

              <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-dashed border-neutral-500/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Refundable Booking</p>
                  <p className="text-xs text-neutral-500">Adds flexibility with dynamic risk pricing.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.refundable}
                    onChange={(event) => setForm((prev) => ({ ...prev, refundable: event.target.checked }))}
                    className="h-4 w-4 rounded border-neutral-400 accent-amber-500"
                  />
                  Yes
                </label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">Message to Reservation Team</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/15 bg-black/30 text-white focus:border-amber-300/60" : "border-black/15 bg-white/70 text-black focus:border-amber-700/60"}`}
                  placeholder="Airport transfer, anniversary setup, dietary notes..."
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <Button type="submit" className="w-full justify-center gap-2 rounded-xl py-3 text-sm tracking-[0.14em]">
                  <BadgePercent className="h-4 w-4" />
                  Send Registration With AI Price
                </Button>
              </div>
            </div>
          </form>

          <aside className={`rounded-3xl border p-6 md:p-7 ${cardBaseClass}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight">Live Price Preview</h3>
              {(quoteLoading || roomsLoading) && <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />}
            </div>

            {selectedRoom && (
              <div className="mt-5 rounded-2xl border border-dashed border-neutral-500/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Selected Room</p>
                <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                  <BedDouble className="h-4 w-4" />
                  {roomTypeLabel(selectedRoom.type)} - Room {selectedRoom.roomNumber}
                </p>
                <p className="mt-2 text-sm text-neutral-500">Base: {formatMoney(selectedRoom.basePrice)} / night</p>
              </div>
            )}

            {quote ? (
              <div className="mt-5 space-y-4">
                <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-white/70"}`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">AI Nightly Rate</p>
                  <p className="mt-1 text-4xl font-bold">{formatMoney(quote.dynamicPrice)}</p>
                  <p className="mt-1 text-sm text-neutral-500">Base rate: {formatMoney(quote.basePrice)}</p>
                </div>

                <div className="space-y-2 rounded-2xl border border-neutral-500/25 p-4 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-neutral-500"><CalendarDays className="h-4 w-4" /> Stay length</span>
                    <span>{quote.stayNights} nights</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-neutral-500">Subtotal</span>
                    <span>{formatMoney(quote.estimatedSubtotal)}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-neutral-500">Taxes</span>
                    <span>{formatMoney(quote.estimatedTaxes)}</span>
                  </p>
                  <p className="flex items-center justify-between border-t border-neutral-500/25 pt-2 text-base font-semibold">
                    <span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4" /> Estimated total</span>
                    <span>{formatMoney(quote.estimatedTotal)}</span>
                  </p>
                </div>

                <div className={`rounded-2xl p-4 text-sm ${isDark ? "bg-amber-300/10 text-amber-100" : "bg-amber-100/70 text-amber-900"}`}>
                  <p className="text-xs uppercase tracking-[0.18em]">AI Insight</p>
                  <p className="mt-1 leading-relaxed">{quote.aiInsight}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-neutral-500/25 px-3 py-2">
                    <p className="text-neutral-500">Occupancy</p>
                    <p className="font-semibold">{String(quote.factors.occupancyRate)}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-500/25 px-3 py-2">
                    <p className="text-neutral-500">Lead Days</p>
                    <p className="font-semibold">{String(quote.factors.leadDays)}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-500/25 px-3 py-2">
                    <p className="text-neutral-500">Rule Mult.</p>
                    <p className="font-semibold">{String(quote.factors.ruleMultiplier)}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-500/25 px-3 py-2">
                    <p className="text-neutral-500">AI Mult.</p>
                    <p className="font-semibold">{String(quote.factors.aiMultiplier)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`mt-5 rounded-2xl border border-dashed p-5 text-sm ${isDark ? "border-white/15 text-neutral-400" : "border-black/15 text-neutral-600"}`}>
                {quoteLoading
                  ? "Calculating AI price..."
                  : "Choose room and stay details to generate a live quote."}
              </div>
            )}

            {quoteError && <p className="mt-4 text-sm text-rose-400">{quoteError}</p>}
          </aside>
        </div>
      </div>
    </Section>
  );
}
