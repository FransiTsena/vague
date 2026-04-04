"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
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
        const response = await fetch("/api/pricing/rooms", { cache: "no-store" });
        const data = (await response.json()) as { rooms?: RoomOption[]; error?: string };

        if (!response.ok || data.error) {
          if (active) {
            setError(data.error || "Unable to load room inventory.");
            setRooms([]);
          }
          return;
        }

        if (active) {
          // Find the best representative room for each type (prefer naturally available ones)
          const typeSet = new Set<string>();
          const featuredRooms: RoomOption[] = [];
          
          // First pass: try to find an available room for each type
          for (const room of data.rooms || []) {
            if (room.status === "available" && !typeSet.has(room.type)) {
              typeSet.add(room.type);
              featuredRooms.push(room);
            }
          }
          
          // Second pass: if a type wasn't available, just pick any room of that type to show it
          for (const room of data.rooms || []) {
            if (!typeSet.has(room.type)) {
              typeSet.add(room.type);
              featuredRooms.push(room);
            }
          }
          
          // Sort by basePrice ascending
          featuredRooms.sort((a, b) => a.basePrice - b.basePrice);
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
        <div className="mb-16 flex flex-col md:flex-row items-baseline justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-serif tracking-tight">Our Accommodations</h2>
            <p className="mt-6 text-lg md:text-xl font-light leading-relaxed text-neutral-500">
              Immerse yourself in thoughtfully curated spaces. Each room promises an elevated experience with uncompromised comfort and timeless aesthetics.
            </p>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 group">
                  {room.images && room.images.length > 0 ? (
                    <Image
                      src={room.images[0]}
                      alt={`${roomTitle(room.type)} View`}
                      fill
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                     <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl tracking-widest text-neutral-300">
                        VAGUE
                     </div>
                  )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="absolute bottom-0 w-full translate-y-4 p-8 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                  <Link href={`/booking?roomId=${room.id}`} className="flex w-full items-center justify-between border-b border-white/40 pb-3 text-white transition-colors hover:border-white">
                    <span className="text-[11px] uppercase tracking-widest">Reserve Stay</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-start">
                <div className="flex w-full items-baseline justify-between mb-2">
                  <h3 className="font-serif text-2xl">{roomTitle(room.type)}</h3>
                  <p className="text-sm text-neutral-500">From {formatMoney(room.basePrice)}</p>
                </div>
                {room.description && (
                  <p className="text-sm leading-relaxed text-neutral-500 line-clamp-2 md:line-clamp-3">
                    {room.description}
                  </p>
                )}
                <Link href={`/booking?roomId=${room.id}`} className="mt-6 text-[10px] uppercase tracking-widest font-medium border-b border-black/20 dark:border-white/20 pb-1 hover:border-black dark:hover:border-white transition-colors">
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