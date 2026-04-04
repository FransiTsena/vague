"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, Check, Star } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

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
  images: string[];
  videoUrl?: string | null;
  description: string;
  amenities: string[];
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
}

interface BookingCreationResponse {
  bookingId: string;
  reference: string;
  summary: {
    roomType: RoomType;
    roomNumber: string;
    totalPrice: number;
    stayNights: number;
  };
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
    maximumFractionDigits: 0,
  }).format(amount);
}

function roomTypeLabel(type: RoomType) {
  if (type === "suite") return "Suite";
  if (type === "deluxe") return "Deluxe";
  return "Standard";
}

interface BookingFlowProps {
  initialRoomId?: string;
}

export default function BookingFlow({ initialRoomId }: BookingFlowProps) {
  const router = useRouter();
  const { isDark } = useTheme();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  const uniqueRoomTypes = useMemo(() => {
    const map = new Map<RoomType, RoomOption>();
    rooms.forEach((r) => {
      if (!map.has(r.type) || (map.get(r.type)?.status !== "available" && r.status === "available")) {
        map.set(r.type, r);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.basePrice - a.basePrice);
  }, [rooms]);

  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    roomId: initialRoomId || "",
    checkIn: toDateInputValue(addDays(new Date(), 7)),
    checkOut: toDateInputValue(addDays(new Date(), 9)),
    guests: 2,
    mealPlan: "breakfast" as MealPlan,
    channel: "direct" as BookingChannel,
    loyaltyTier: "none" as LoyaltyTier,
    refundable: true,
    promoCode: "",
    specialRequests: 0,
    name: "",
    phone: "",
    email: "",
    note: "",
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
      const data = (await response.json()) as { rooms?: RoomOption[]; error?: string };

      if (!response.ok || data.error) {
        setRooms([]);
        setRoomsError(data.error || "Unable to load room inventory.");
        return;
      }

      const roomList = data.rooms || [];
      setRooms(roomList);

      if (!form.roomId && roomList.length > 0) {
        const firstAvailable = roomList.find((room) => room.status === "available") || roomList[0];
        setForm((prev) => ({ ...prev, roomId: firstAvailable.id }));
      }
    } catch {
      setRooms([]);
      setRoomsError("Unable to connect to room inventory.");
    } finally {
      setRoomsLoading(false);
    }
  }, [form.roomId]);

  const fetchQuote = useCallback(async () => {
    if (!form.roomId || !form.checkIn || !form.checkOut) {
      setQuote(null);
      return;
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

      const response = await fetch(`/api/pricing?${params.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as PricingQuote & { error?: string };

      if (!response.ok || data.error) {
        setQuote(null);
        setQuoteError(data.error || "Unable to calculate dynamic pricing.");
        return;
      }

      setQuote(data);
    } catch {
      setQuote(null);
      setQuoteError("Pricing service unavailable.");
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
    }, 280);
    return () => clearTimeout(timeout);
  }, [fetchQuote]);

  const handleDateChange = (field: "checkIn" | "checkOut", value: string) => {
    setForm((prev) => {
      if (field === "checkIn") {
        const nextCheckInDate = new Date(value);
        const currentCheckOutDate = new Date(prev.checkOut);
        if (currentCheckOutDate <= nextCheckInDate) {
          return {
            ...prev,
            checkIn: value,
            checkOut: toDateInputValue(addDays(nextCheckInDate, 1)),
          };
        }
      }
      return { ...prev, [field]: value };
    });
  };

  const canGoNext = Boolean(form.roomId && quote && !quoteLoading);
  const canSubmit = Boolean(form.name.trim() && form.phone.trim() && quote && !submitting);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    if (!quote) {
      setSubmitError("Please wait for pricing before confirming booking.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          roomId: form.roomId,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          guests: form.guests,
          mealPlan: form.mealPlan,
          channel: form.channel,
          loyaltyTier: form.loyaltyTier,
          refundable: form.refundable,
          promoCode: form.promoCode.trim(),
          specialRequests: form.specialRequests,
          note: form.note.trim(),
          quotedNightly: quote.dynamicPrice,
          quotedTotal: quote.estimatedTotal,
        }),
      });

      const data = (await response.json()) as BookingCreationResponse;
      if (!response.ok || data.error) {
        setSubmitError(data.error || "Unable to create booking.");
        return;
      }

      router.push(`/booking/confirmation?bookingId=${data.bookingId}&reference=${encodeURIComponent(data.reference)}`);
    } catch {
      setSubmitError("Booking service unavailable. Try again shortly.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = isDark
    ? "w-full border-b border-white/20 bg-transparent py-4 text-[15px] outline-none focus:border-white text-white placeholder:text-white/30"
    : "w-full border-b border-black/20 bg-transparent py-4 text-[15px] outline-none focus:border-black text-black placeholder:text-black/30";

  const labelClass = "text-[10px] uppercase tracking-[0.2em] font-medium whitespace-nowrap opacity-60";

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.1fr] xl:gap-24">
      {/* LEFT: LIVE SUMMARY & ROOM CARD */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-32 overflow-hidden rounded-none border border-neutral-200 dark:border-neutral-800 ${isDark ? "bg-[#0a0a0a]" : "bg-[#fcfbf9]"}`}
      >
        <AnimatePresence mode="popLayout">
          {selectedRoom ? (
            <motion.div
              key={selectedRoom.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                {selectedRoom.images && selectedRoom.images.length > 0 ? (
                  <Image
                    src={selectedRoom.images[0]}
                    alt={`${roomTypeLabel(selectedRoom.type)} View`}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-serif text-2xl tracking-widest text-neutral-400">VAGUE</span>
                  </div>
                )}
              </div>
              <div className="p-8 md:p-12">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                    Room {selectedRoom.roomNumber}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                    {formatMoney(selectedRoom.basePrice)} <span className="opacity-50">/ Night</span>
                  </p>
                </div>
                <h3 className="mb-4 font-serif text-3xl md:text-4xl">{roomTypeLabel(selectedRoom.type)}</h3>
                {selectedRoom.description && (
                  <p className="mb-8 text-sm leading-relaxed text-neutral-500">{selectedRoom.description}</p>
                )}

                {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                  <div className="mb-10 grid grid-cols-2 gap-y-3 gap-x-4">
                    {selectedRoom.amenities.slice(0, 4).map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-500">
                        <Check className="h-3 w-3 opacity-60" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-black/10 dark:border-white/10 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] uppercase tracking-[0.25em] font-medium">Your Quote</h4>
                    {quoteLoading && <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />}
                  </div>
                  
                  {quote ? (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="mb-6 flex items-baseline gap-2">
                        <span className="font-serif text-4xl">{formatMoney(quote.dynamicPrice)}</span>
                        <span className="text-xs uppercase tracking-widest text-neutral-500">/ Night</span>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                         <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-3">
                           <span className="text-neutral-500">Stay</span>
                           <span>{quote.stayNights} Nights, {quote.guestCount} Guests</span>
                         </div>
                         <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-3">
                           <span className="text-neutral-500">Subtotal</span>
                           <span>{formatMoney(quote.estimatedSubtotal)}</span>
                         </div>
                         <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-3">
                           <span className="text-neutral-500">Taxes</span>
                           <span>{formatMoney(quote.estimatedTaxes)}</span>
                         </div>
                         <div className="flex justify-between pt-2">
                           <span className="font-medium">Estimated Total</span>
                           <span className="font-serif text-lg">{formatMoney(quote.estimatedTotal)}</span>
                         </div>
                      </div>

                      {quote.aiInsight && (
                        <div className="mt-8 flex gap-3 text-[11px] leading-relaxed text-neutral-500">
                          <Star className="h-3 w-3 shrink-0 mt-0.5 opacity-40 shrink-0" />
                          <p>{quote.aiInsight}</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-sm italic text-neutral-500">
                      {quoteLoading ? "Orchestrating your itinerary..." : "Select dates to reveal pricing."}
                    </div>
                  )}
                  {quoteError && <p className="mt-4 text-xs text-rose-400 uppercase tracking-widest">{quoteError}</p>}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center p-8 text-center text-sm text-neutral-500">
              {roomsLoading ? "Sourcing rooms..." : "Awaiting room selection."}
            </div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* RIGHT: THE FORM */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="w-full max-w-lg lg:pt-8"
      >
        <div className="mb-12 flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-6">
          <h2 className="font-serif text-2xl tracking-wide">
            {step === 1 ? "Stay Preferences" : step === 2 ? "Services & Upgrades" : "Guest Details"}
          </h2>
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Step {step} / 3</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="form-step-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-4">
                <label className={labelClass}>Select Accommodations</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {roomsLoading && <div className="col-span-3 text-sm text-neutral-500">Loading inventory...</div>}
                  {!roomsLoading && uniqueRoomTypes.length === 0 && <div className="col-span-3 text-sm text-rose-400 text-center py-4 border">Fully Booked</div>}
                  {!roomsLoading &&
                    uniqueRoomTypes.map((roomOption) => {
                      const isAvailable = roomOption.status === "available";
                      const isSelected = form.roomId === roomOption.id;
                      
                      return (
                        <button
                          key={roomOption.id}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            if (isAvailable) setForm((prev) => ({ ...prev, roomId: roomOption.id }));
                          }}
                          className={`p-4 text-center border transition-all relative ${
                            !isAvailable
                              ? "border-black/5 bg-black/5 text-black/40 cursor-not-allowed dark:border-white/5 dark:bg-white/5 dark:text-white/40"
                              : isSelected
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-neutral-200 bg-transparent text-black dark:border-neutral-800 dark:text-white hover:border-black/30 dark:hover:border-white/30"
                          }`}
                        >
                          <h4 className="font-serif text-lg mb-1">{roomTypeLabel(roomOption.type)}</h4>
                          <p className={`text-[9px] uppercase tracking-widest ${isSelected ? 'opacity-90' : 'opacity-50'}`}>
                            {isAvailable ? `From ${formatMoney(roomOption.basePrice)}` : "Fully Booked"}
                          </p>
                        </button>
                      );
                    })}
                </div>
                {roomsError && <p className="text-[11px] text-rose-400 uppercase tracking-widest">{roomsError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Check-In</label>
                  <input
                    type="date"
                    value={form.checkIn}
                    onChange={(event) => handleDateChange("checkIn", event.target.value)}
                    className={`${inputClass} tracking-widest font-light`}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Check-Out</label>
                  <input
                    type="date"
                    min={form.checkIn}
                    value={form.checkOut}
                    onChange={(event) => handleDateChange("checkOut", event.target.value)}
                    className={`${inputClass} tracking-widest font-light`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Guests</label>
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
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => setStep(2)}
                  className={`w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all ${
                    canGoNext 
                      ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200" 
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-900"
                  }`}
                >
                  Continue to Services
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="form-step-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Dining Experience</label>
                  <select
                    value={form.mealPlan}
                    onChange={(event) => setForm((prev) => ({ ...prev, mealPlan: event.target.value as MealPlan }))}
                    className={inputClass}
                  >
                    <option value="room_only" className="text-black bg-white dark:bg-black dark:text-white">Room Only</option>
                    <option value="breakfast" className="text-black bg-white dark:bg-black dark:text-white">Breakfast</option>
                    <option value="half_board" className="text-black bg-white dark:bg-black dark:text-white">Half Board</option>
                    <option value="full_board" className="text-black bg-white dark:bg-black dark:text-white">Full Board</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="flex flex-col gap-2">
                  <label className={labelClass}>Source (Internal)</label>
                  <select
                    value={form.channel}
                    onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value as BookingChannel }))}
                    className={inputClass}
                  >
                    <option value="direct" className="text-black bg-white dark:bg-black dark:text-white">Direct Booking</option>
                    <option value="ota" className="text-black bg-white dark:bg-black dark:text-white">Online Agency</option>
                    <option value="corporate" className="text-black bg-white dark:bg-black dark:text-white">Corporate</option>
                    <option value="agent" className="text-black bg-white dark:bg-black dark:text-white">Travel Agent</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Loyalty Status</label>
                  <select
                    value={form.loyaltyTier}
                    onChange={(event) => setForm((prev) => ({ ...prev, loyaltyTier: event.target.value as LoyaltyTier }))}
                    className={inputClass}
                  >
                    <option value="none" className="text-black bg-white dark:bg-black dark:text-white">New Guest</option>
                    <option value="silver" className="text-black bg-white dark:bg-black dark:text-white">Silver Member</option>
                    <option value="gold" className="text-black bg-white dark:bg-black dark:text-white">Gold Member</option>
                    <option value="platinum" className="text-black bg-white dark:bg-black dark:text-white">Platinum Pinnacle</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 pb-2">
                <input
                  type="checkbox"
                  id="refundable"
                  checked={form.refundable}
                  onChange={(event) => setForm((prev) => ({ ...prev, refundable: event.target.checked }))}
                  className="h-4 w-4 appearance-none border border-black/20 dark:border-white/20 checked:bg-black dark:checked:bg-white cursor-pointer relative after:content-[''] after:absolute after:inset-[2px] after:bg-white dark:after:bg-black after:opacity-0 checked:after:opacity-100"
                />
                <label htmlFor="refundable" className="text-sm flex flex-col cursor-pointer">
                  <span>Flexible Cancellation</span>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 mt-1">Fully refundable 48h prior</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="flex items-center justify-center gap-3 py-4 text-[11px] uppercase tracking-[0.25em] font-medium border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>

                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => setStep(3)}
                  className={`w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all ${
                    canGoNext 
                      ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200" 
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-900"
                  }`}
                >
                  Checkout Details
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="form-step-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className={inputClass}
                  placeholder="e.g. Eleanor Vance"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className={inputClass}
                  placeholder="eleanor@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Phone Number</label>
                <input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className={inputClass}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Privilege Code</label>
                  <input
                    value={form.promoCode}
                    onChange={(event) => setForm((prev) => ({ ...prev, promoCode: event.target.value }))}
                    className={`${inputClass} uppercase`}
                    placeholder="Enter code"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Special Requests</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={form.specialRequests}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        specialRequests: Math.max(0, Math.min(5, Number(event.target.value) || 0)),
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Arrival Notes</label>
                <textarea
                  rows={2}
                  value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  className={`${inputClass} resize-none border-b-0 border border-t-[1px] border-black/20 dark:border-white/20 p-4 leading-relaxed`}
                  placeholder="Expected arrival time, celebrations, or specific requirements..."
                />
              </div>

              {submitError && <p className="text-[11px] text-rose-400 uppercase tracking-widest">{submitError}</p>}

              <div className="grid grid-cols-2 gap-4 pt-8">
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="flex items-center justify-center gap-3 py-4 text-[11px] uppercase tracking-[0.25em] font-medium border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Services
                </button>

                <button 
                  type="submit" 
                  disabled={!canSubmit} 
                  className={`flex items-center justify-center gap-3 py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all ${
                    canSubmit 
                      ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200" 
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-900"
                  }`}
                >
                  {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm & Book"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-16 text-center">
          <Link href="/#rooms" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Return to Directory
          </Link>
        </div>
      </motion.form>
    </div>
  );
}

