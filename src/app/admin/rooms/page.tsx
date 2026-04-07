"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Plus, Edit2, Trash2, Camera, MoreHorizontal, Check, X } from "lucide-react";

interface IRoom {
  _id: string;
  roomNumber: string;
  type: "standard" | "deluxe" | "suite";
  basePrice: number;
  currentPrice: number;
  status: "available" | "booked" | "occupied";
  amenities: string[];
}

export default function RoomsAdmin() {
  const { isDark } = useTheme();
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "standard",
    basePrice: 0,
    currentPrice: 0,
    status: "available",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/admin/rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRoom ? `/api/admin/rooms/${editingRoom._id}` : "/api/admin/rooms";
    const method = editingRoom ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAdding(false);
        setEditingRoom(null);
        setFormData({ roomNumber: "", type: "standard", basePrice: 0, currentPrice: 0, status: "available" });
        fetchRooms();
      }
    } catch (err) {
      console.error("Error saving room:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
      fetchRooms();
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  const startEdit = (room: IRoom) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      basePrice: room.basePrice,
      currentPrice: room.currentPrice,
      status: room.status,
    });
    setIsAdding(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "text-emerald-500 bg-emerald-500/10";
      case "booked": return "text-amber-500 bg-amber-500/10";
      case "occupied": return "text-rose-500 bg-rose-500/10";
      default: return "text-neutral-500 bg-neutral-500/10";
    }
  };

  return (
    <div className={`min-h-screen p-8 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-light mb-2 italic">Room <span className="not-italic text-neutral-400">Inventory</span></h1>
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest leading-loose">Asset orchestration & availability</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingRoom(null); }}
          className={`px-6 py-2 flex items-center gap-2 border text-xs font-mono transition-all ${isDark ? "border-white/20 hover:bg-white/10" : "border-black/10 hover:bg-black/5"}`}
        >
          <Plus className="w-4 h-4" /> ADD UNIT
        </button>
      </div>

      {isAdding && (
        <div className={`mb-12 p-8 border ${isDark ? "border-white/10" : "border-black/5"} animate-in fade-in slide-in-from-top-4`}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Unit Number</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className={`w-full p-2 bg-transparent border-b outline-none text-sm ${isDark ? "border-white/20 focus:border-white" : "border-black/10 focus:border-black"}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Category</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className={`w-full p-2 bg-transparent border-b outline-none text-sm appearance-none ${isDark ? "border-white/20 focus:border-white" : "border-black/10 focus:border-black"}`}
              >
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe Suite</option>
                <option value="suite">Executive Suite</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Base Price (€)</label>
              <input
                type="number"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className={`w-full p-2 bg-transparent border-b outline-none text-sm ${isDark ? "border-white/20 focus:border-white" : "border-black/10 focus:border-black"}`}
              />
            </div>
            <div className="flex gap-4 col-span-full pt-4">
              <button type="submit" className={`px-8 py-3 bg-neutral-900 text-white dark:bg-white dark:text-black text-[10px] font-mono uppercase tracking-widest`}>
                {editingRoom ? "Update Asset" : "Initialize Asset"}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-8 py-3 text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20 opacity-30 animate-pulse">
          <p className="font-mono text-xs uppercase tracking-[0.5em]">Synchronizing Infrastructure...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "border-white/5" : "border-black/5"}`}>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-normal">Room</th>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-normal">Tier</th>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-normal">Pricing</th>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-normal">Status</th>
                <th className="py-6 px-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {rooms.map((room) => (
                <tr key={room._id} className="group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-8 px-4 font-serif text-2xl font-light">
                    {room.roomNumber}
                  </td>
                  <td className="py-8 px-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-current opacity-40">
                      {room.type}
                    </span>
                  </td>
                  <td className="py-8 px-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-light">€{room.currentPrice}</span>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase">Base: €{room.basePrice}</span>
                    </div>
                  </td>
                  <td className="py-8 px-4">
                    <span className={`text-[8px] font-mono uppercase font-bold tracking-[0.2em] px-3 py-1.5 rounded-full ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="py-8 px-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(room)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(room._id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded">
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
