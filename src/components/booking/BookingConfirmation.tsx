"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";

interface BookingDetails {
  _id: string;
  checkIn: string;
  checkOut: string;
  pricePaid: number;
  numberOfGuests: number;
  roomId?: {
    roomNumber?: string;
    type?: string;
  };
  guestId?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

interface BookingConfirmationProps {
  bookingId?: string;
  reference?: string;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function BookingConfirmation({ bookingId, reference }: BookingConfirmationProps) {
  const { isDark } = useTheme();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(bookingId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      setError("Missing booking id.");
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/booking/${bookingId}`, { cache: "no-store" });
        const data = (await response.json()) as { booking?: BookingDetails; error?: string };

        if (!response.ok || data.error || !data.booking) {
          if (active) {
            setError(data.error || "Unable to load booking details.");
          }
          return;
        }

        if (active) {
          setBooking(data.booking);
        }
      } catch {
        if (active) {
          setError("Unable to connect to booking service.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [bookingId]);

  const frameClass = isDark
    ? "border-white/5 bg-neutral-900/50 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
    : "border-black/5 bg-white/70 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]";

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10 inline-flex"
        >
          <div className="relative">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 stroke-[1.5px]" />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl"
            />
          </div>
        </motion.div>

        <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-6">
          Reserved for you.
        </h1>
        
        <p className={`text-lg md:text-xl font-light mb-12 max-w-xl mx-auto ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          Your journey to VAGUE starts here. We've sent your itinerary and digital key to your inbox.
        </p>

        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500 ${isDark ? "bg-white/5 border-white/10 text-neutral-300" : "bg-black/5 border-black/10 text-neutral-600"}`}>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">Reference:</span>
          <span className="font-mono text-sm tracking-widest">{reference || "Pending"}</span>
        </div>

        {loading && (
          <div className="mt-20 py-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-400" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-20 text-rose-500 font-light">{error}</div>
        )}

        {!loading && booking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-24 border-t border-b border-neutral-500/10 py-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-left">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Resident</p>
                <p className="text-xl font-serif leading-tight">{booking.guestId?.name || "Guest"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Sanctuary</p>
                <p className="text-xl font-serif leading-tight truncate">{booking.roomId?.type || "Standard Room"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Arrival</p>
                <p className="text-xl font-serif leading-tight">{new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Departure</p>
                <p className="text-xl font-serif leading-tight">{new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="mt-20 text-center">
               <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold mb-2">Total Amount</p>
               <p className="text-4xl font-serif text-emerald-500/90">{formatMoney(booking.pricePaid)}</p>
            </div>
          </motion.div>
        )}

        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-12">
          <Link href="/" className="group flex items-center gap-4 text-sm uppercase tracking-[0.2em] font-bold transition-all">
            <span className={`transition-colors ${isDark ? "text-neutral-500 group-hover:text-white" : "text-neutral-400 group-hover:text-black"}`}>Return Home</span>
            <div className={`h-px w-8 transition-all group-hover:w-16 ${isDark ? "bg-white/20 group-hover:bg-white" : "bg-black/20 group-hover:bg-black"}`} />
          </Link>
          
          <Link href="/booking">
            <Button className={`rounded-full px-12 py-6 text-xs uppercase tracking-[0.3em] font-bold transition-all hover:scale-105 shadow-2xl ${isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"}`}>
              New Booking
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
