"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function AIVisualization() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
    const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

    // Use empty array or null for dataPoints during SSR to prevent hydration mismatch
    const dataPoints = mounted ? Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 3 + 2,
    })) : [];

    return (
        <section
            ref={containerRef}
            className="relative py-48 bg-black overflow-hidden flex flex-col items-center justify-center px-6"
        >
            <motion.div 
                style={{ scale, opacity, y }}
                className="max-w-7xl w-full text-center space-y-12"
            >
                <div className="space-y-4">
                    <span className="text-white/40 text-[10px] uppercase tracking-[0.6em]">Predictive Intelligence</span>
                    <h2 className="text-4xl md:text-7xl font-serif text-white font-light">
                        Machine Learning <br />
                        <span className="italic font-extralight text-neutral-500">at the Core</span>
                    </h2>
                </div>

                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] border border-white/10 bg-black/50 overflow-hidden group">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
                    
                    {/* Neural Network Visualization Simulation */}
                    <svg className="absolute inset-0 w-full h-full">
                        {dataPoints.map((point) => (
                            <motion.circle
                                key={point.id}
                                cx={`${point.x}%`}
                                cy={`${point.y}%`}
                                r={point.size}
                                fill="white"
                                initial={{ opacity: 0.1 }}
                                animate={{ 
                                    opacity: [0.1, 0.6, 0.1],
                                    scale: [1, 1.5, 1]
                                }}
                                transition={{
                                    duration: point.duration,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                        {/* Connecting Lines (Simulated Paths) */}
                        <motion.path
                            d="M 10 50 Q 50 10 90 50"
                            stroke="white"
                            strokeWidth="0.5"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 0.2 }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                        <motion.path
                            d="M 10 30 Q 50 90 90 30"
                            stroke="white"
                            strokeWidth="0.5"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 0.2 }}
                            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4 bg-black/80 backdrop-blur-md p-10 border border-white/20">
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-xs uppercase tracking-widest text-white mb-2"
                            >
                                Processing Forecasts...
                            </motion.div>
                            <div className="text-4xl md:text-6xl font-serif text-white tracking-widest">+24.8%</div>
                            <div className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">Projected Revenue Growth</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left mt-24">
                    <div className="space-y-4 border-l border-white/10 pl-8">
                        <div className="text-xl font-serif text-white">Demand Anticipation</div>
                        <p className="text-sm text-neutral-500 font-light leading-relaxed">
                            AI analyzes global travel trends and local events, adjusting your pricing models 6 months in advance.
                        </p>
                    </div>
                    <div className="space-y-4 border-l border-white/10 pl-8">
                        <div className="text-xl font-serif text-white">Neural Scheduling</div>
                        <p className="text-sm text-neutral-500 font-light leading-relaxed">
                            Staffing levels automatically scale based on predicted occupancy, reducing human overhead by 15%.
                        </p>
                    </div>
                    <div className="space-y-4 border-l border-white/10 pl-8">
                        <div className="text-xl font-serif text-white">Revenue Discovery</div>
                        <p className="text-sm text-neutral-500 font-light leading-relaxed">
                            Identify micro-monetization opportunities through local provenance markets hidden in your data.
                        </p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
