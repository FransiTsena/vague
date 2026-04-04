"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { useTheme } from "@/context/ThemeContext";

interface RoomOption {
  id: string;
  roomNumber: string;
  type: "standard" | "deluxe" | "suite";
  basePrice: number;
  currentPrice: number;
  status: "available" | "booked" | "occupied";
  images: string[];
  videoUrl?: string | null;
  description: string;
  amenities: string[];
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function roomTitle(type: RoomOption["type"]) {
  if (type === "suite") return "The Suite Collection";
  if (type === "deluxe") return "Deluxe Room";
  return "Standard Room";
}

export default function RoomShowcase() {
  const { isDark } = useTheme();
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadRooms = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/v1/rooms", { cache: "no-store" });
        if (!response.ok) {
          if (active) {
            setError("Unable to load room inventory.");
            setRooms([]);
          }
          return;
        }
        const data = await response.json();

        if (active) {
          // Group by type to show variety
          const typeSet = new Set<string>();
          const featuredRooms: RoomOption[] = [];
          
          for (const room of (data || [])) {
            if (!typeSet.has(room.type)) {
              typeSet.add(room.type);
              featuredRooms.push({
                ...room,
                id: room._id || room.id // Normalize ID from MongoDB _id
              });
            }
          }
          
          featuredRooms.sort((a, b) => {
            const order = { 'suite': 3, 'deluxe': 2, 'standard': 1 };
            return (order[b.type] || 0) - (order[a.type] || 0);
          });
          setRooms(featuredRooms);
        }
      } catch {
        if (active) {
          setError("Unable to connect to room inventory.");
          setRooms([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRooms();
    return () => {
      active = false;
    };
  }, []);

  const featured = rooms.slice(0, 3);

  if (loading || error || featured.length === 0) return null;

  return (
    <Section id="rooms" className={isDark ? "bg-black text-white" : "bg-[#fcfbf9] text-black"}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 flex flex-col md:flex-row items-baseline justify-between gap-12">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight leading-none mb-4">Our Accommodations</h2>
            <p className="mt-8 text-xl md:text-2xl font-light leading-relaxed text-neutral-500">
              Immerse yourself in thoughtfully curated spaces. Each room promises an elevated experience with uncompromised comfort and timeless aesthetics.
            </p>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {featured.map((room) => (
            <motion.article
              key={room.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="group relative flex flex-col cursor-pointer"
              onClick={() => window.location.href = `/booking?roomId=${room.id}`}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <img
                  src={room.images?.[0] || "/default-room.jpg"}
                  alt={`${roomTitle(room.type)} View`}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="absolute bottom-0 w-full translate-y-8 p-10 opacity-0 transition-all duration-700 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                  <Link href={`/booking?roomId=${room.id}`} className="flex w-full items-center justify-between border-b border-white/20 pb-4 text-white transition-colors hover:border-white">
                    <span className="text-[10px] uppercase tracking-[0.3em]">Reserve Stay</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-start px-2">
                <div className="flex w-full items-baseline justify-between mb-4">
                  <h3 className="font-serif text-3xl font-light">{roomTitle(room.type)}</h3>
                  <div className="text-right">
                    <p className="text-base font-light text-neutral-500 italic">
                      From {formatMoney(room.currentPrice || room.basePrice)}
                    </p>
                  </div>
                </div>
                {room.description && (
                  <p className="text-base leading-relaxed font-light text-neutral-400 line-clamp-2 md:line-clamp-3 mb-6">
                    {room.description}
                  </p>
                )}
                <Link href={`/booking?roomId=${room.id}`} className="text-[10px] uppercase tracking-[0.3em] font-medium border-b border-black/10 dark:border-white/10 pb-2 hover:border-black dark:hover:border-white transition-all duration-500">
                  Explore Details
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
