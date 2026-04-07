"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Calendar, User, MoreVertical, Trash2, CheckCircle, Clock, ExternalLink, Activity, ChevronDown, ChevronUp } from "lucide-react";
import BookingVelocity from "@/components/sections/BookingVelocity";

interface IBooking {
  _id: string;
  guestId: {
    _id: string;
    name: string;
    email: string;
    isVip: boolean;
    predictedSegment: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
    type: string;
  };
  checkIn: string;
  checkOut: string;
  pricePaid: number;
  bookingStatus: string;
  createdAt: string;
}

export default function BookingsAdmin() {
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntelligence, setShowIntelligence] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel/delete this booking?")) return;
    try {
      await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      fetchBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked_in": return <span className="text-[7px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase font-mono tracking-widest font-bold">In-Situ</span>;
      case "checked_out": return <span className="text-[7px] bg-neutral-500/10 text-neutral-500 border border-neutral-500/20 px-2 py-0.5 rounded-full uppercase font-mono tracking-widest font-bold">Archived</span>;
      default: return <span className="text-[7px] bg-sky-500/10 text-sky-500 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase font-mono tracking-widest font-bold">Confirmed</span>;
    }
  };

  return (
    <div className={`min-h-screen p-8 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif font-light mb-2">Reservation <span className="italic text-neutral-400">Ledger</span></h1>
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest leading-loose">Guest migration & lifecycle oversight</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">
          <span>Total Volume: {bookings.length}</span>
          <div className="w-[1px] h-4 bg-current" />
          <button 
            onClick={() => setShowIntelligence(!showIntelligence)}
            className={`ml-4 flex items-center gap-2 px-3 py-1 border transition-all ${
              showIntelligence 
                ? "bg-white text-black border-white" 
                : "border-current hover:bg-white hover:text-black"
            }`}
          >
            {showIntelligence ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Intelligence
          </button>
        </div>
      </div>

      {showIntelligence && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <BookingVelocity />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-24 opacity-20">
          <p className="font-mono text-xs animate-pulse tracking-[0.5em]">Synchronizing Registry...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`border-b ${isDark ? "border-white/10" : "border-black/5"}`}>
              <tr>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-400 uppercase font-normal tracking-widest">Guest Intelligence</th>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-400 uppercase font-normal tracking-widest">Asset</th>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-400 uppercase font-normal tracking-widest">Timeline</th>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-400 uppercase font-normal tracking-widest">Revenue</th>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-400 uppercase font-normal tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {bookings.map((booking) => (
                <tr key={booking._id} className="group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-8 px-4">
                    <div className="flex items-start gap-4">
                       <div className={`p-2 rounded-sm ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                          <User className="w-4 h-4 opacity-40" />
                       </div>
                       <div className="flex flex-col">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-serif text-xl font-light">{booking.guestId?.name}</span>
                            {booking.guestId?.isVip && <span className="text-[6px] font-mono border border-amber-500/40 text-amber-500 px-1 py-0.5 rounded uppercase">VIP</span>}
                          </div>
                          <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">{booking.guestId?.email}</span>
                          <div className="mt-1 flex items-center gap-2">
                             <span className="text-[7px] font-mono text-sky-500 uppercase tracking-tighter bg-sky-500/5 px-1 rounded">{booking.guestId?.predictedSegment}</span>
                             <span className="text-[7px] font-mono text-neutral-400 uppercase opacity-30">| PREDICTOR ACTIVE</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="py-8 px-4">
                     <div className="flex flex-col">
                        <span className="text-xl font-serif font-light">{booking.roomId?.roomNumber}</span>
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">{booking.roomId?.type}</span>
                     </div>
                  </td>
                  <td className="py-8 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="opacity-40 uppercase">IN:</span>
                        <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="opacity-40 uppercase">OUT:</span>
                        <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-8 px-4">
                    <div className="flex flex-col">
                       <span className="text-xl font-serif font-light">€{booking.pricePaid}</span>
                       <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-tighter">Settled</span>
                    </div>
                  </td>
                  <td className="py-8 px-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(booking._id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded transition-colors" title="Cancel Reservation">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
