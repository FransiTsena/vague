"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PlatformProvenance() {
    const containerRef = useRef<HTMLDivElement>(null);
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);
    const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

    // Scroll-based transition between images
    const imageOpacity = useTransform(scrollYProgress, [0.45, 0.55], [0, 1]);
    const originalImageOpacity = useTransform(scrollYProgress, [0.45, 0.55], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative py-64 bg-black overflow-hidden flex flex-col items-center justify-center px-6"
        >
            {/* Background Narrative Text (Large, Translucent) */}
            <div className="absolute top-20 left-10 opacity-[0.03] select-none pointer-events-none">
                <span className="text-[15vw] font-serif italic whitespace-nowrap leading-none">The Artisan's Soul</span>
            </div>

            <motion.div 
                style={{ opacity, scale, y }}
                className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10"
            >
                {/* Visual Side - High Contrast Floating Frame */}
                <div className="relative aspect-[4/5] md:aspect-[3/4] group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-neutral-900 border border-white/10 p-4">
                    <div className="relative w-full h-full overflow-hidden">
                        {/* Original Image */}
                        <motion.div style={{ opacity: originalImageOpacity }} className="absolute inset-0">
                            <Image
                                src="/photos/services/provenance.jpg"
                                alt="Handcrafted gold-leaf feather piece"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            />
                        </motion.div>

                        {/* Zoomed/Details Image */}
                        <motion.div style={{ opacity: imageOpacity }} className="absolute inset-0">
                            <Image
                                src="/photos/services/provenance_zoomed.jpg"
                                alt="Zoomed detail of handcrafted gold-leaf feather piece"
                                fill
                                className="object-cover scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                        </motion.div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    </div>

                    {/* Floating Soul Tag */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute -top-12 -right-12 bg-white text-black p-8 md:p-10 shadow-2xl space-y-2 text-center"
                    >
                        <span className="text-[9px] uppercase tracking-[0.6em] block opacity-60">Authentication</span>
                        <div className="text-sm font-serif italic tracking-widest whitespace-nowrap">Verified Provenance</div>
                        <div className="w-12 h-[1px] bg-black/20 mx-auto mt-4" />
                    </motion.div>
                    
                    {/* UI Overlay Simulation - Glassmorphism */}
                    <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="absolute bottom-12 left-12 right-12 bg-black/60 backdrop-blur-2xl p-10 border border-white/10 space-y-8 z-20"
                    >
                        <div className="flex justify-between items-end">
                            <div className="space-y-2">
                                <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 block">Digital Soul ID</span>
                                <div className="text-2xl font-serif text-white tracking-[0.2em] uppercase">Luminary <span className="italic text-neutral-400">Feathers</span></div>
                            </div>
                            <div className="text-[10px] text-white/40 font-mono tracking-widest uppercase mb-1">0x7F...44BC</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="https://hackathon.upick.live/provenance/luminary-feathers" target="_blank" className="flex-1">
                                <Button variant="primary" className="w-full py-4 text-[10px] uppercase tracking-[0.4em] rounded-none bg-white text-black border-white hover:bg-black hover:text-white transition-all duration-700 font-medium">
                                    Tip Artisan
                                </Button>
                            </Link>
                            <Link href="https://hackathon.upick.live/provenance/luminary-feathers" target="_blank" className="flex-1">
                                <Button variant="secondary" className="w-full py-4 text-[10px] uppercase tracking-[0.4em] rounded-none border-white/30 text-white hover:bg-white hover:text-black transition-all duration-700">
                                    Acquire
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Narrative Side - Refined Typography & Contrast */}
                <div className="space-y-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-[1px] bg-neutral-800" />
                            <span className="text-[10px] uppercase tracking-[0.8em] text-neutral-500 block leading-none">Smart Provenance</span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-serif text-white font-light leading-[0.85]">
                            The Soul of <br />
                            <span className="italic font-extralight text-neutral-600">The Object</span>
                        </h2>
                    </div>

                    <div className="space-y-12 relative">
                        <div className="absolute -left-12 top-0 text-6xl text-neutral-900 font-serif leading-none italic opacity-30 select-none">“</div>
                        <p className="text-2xl md:text-3xl font-serif font-light text-neutral-200 leading-[1.4] italic relative z-10">
                            Imagine a guest admiring this handcrafted gold-leaf feather piece. Through its <span className="text-white border-b border-white/10 pb-1">Digital Soul</span>, they don't just see a decoration; they see the regional artisan who spent hours gilding each vane.
                        </p>
                        
                        <p className="text-lg text-neutral-500 font-light leading-relaxed max-w-xl">
                            One scan reveals the piece's authentic origin, allowing the guest to <span className="text-neutral-300 font-medium">Tip the Artisan</span> for their craftsmanship or <span className="text-neutral-300 font-medium">Order to Home</span> a custom version, bridging the gap between luxury hospitality and sustainable local economic growth.
                        </p>
                    </div>

                    <div className="pt-16 grid grid-cols-2 gap-16 border-t border-white/5">
                        <div className="space-y-3">
                            <div className="text-4xl font-serif text-white tracking-tight">100%</div>
                            <div className="text-[10px] uppercase tracking-[0.5em] text-neutral-600 font-medium">Direct Revenue</div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-4xl font-serif text-white tracking-tight">Verified</div>
                            <div className="text-[10px] uppercase tracking-[0.5em] text-neutral-600 font-medium">Blockchain Soul</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
