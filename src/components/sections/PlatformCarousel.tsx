"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, Target, TrendingUp, Cpu } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const capabilities = [
    {
        id: "dynamic-pricing",
        title: "AI Dynamic Pricing",
        description: "Real-time occupancy and market data ingestion combined with proprietary neural networks to maximize RevPAR automatically.",
        icon: <TrendingUp className="w-8 h-8" />,
        stat: "+32%",
        label: "Revenue Growth",
        color: "from-blue-500/20 to-transparent"
    },
    {
        id: "smart-scheduling",
        title: "Intelligent Staffing",
        description: "Predictive labor management that scales your workforce based on forecasted guest arrivals, reducing overhead by 18%.",
        icon: <Cpu className="w-8 h-8" />,
        stat: "15ms",
        label: "Decision Latency",
        color: "from-purple-500/20 to-transparent"
    },
    {
        id: "provenance",
        title: "Provenance Engine",
        description: "Blockchain-verified local product integration that creates new high-margin revenue streams from local crafts and goods.",
        icon: <Zap className="w-8 h-8" />,
        stat: "$2.4M",
        label: "Managed GMV",
        color: "from-emerald-500/20 to-transparent"
    },
    {
        id: "guest-intelligence",
        title: "Hyper-Personalization",
        description: "Deep-learning analysis of guest behavior to deliver tailored upsell opportunities and friction-less booking experiences.",
        icon: <Target className="w-8 h-8" />,
        stat: "84%",
        label: "Conversion Lift",
        color: "from-rose-500/20 to-transparent"
    }
];

export default function PlatformCarousel() {
    const [index, setIndex] = useState(0);
    const { isDark } = useTheme();

    const next = () => setIndex((prev) => (prev + 1) % capabilities.length);
    const prev = () => setIndex((prev) => (prev - 1 + capabilities.length) % capabilities.length);

    useEffect(() => {
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className={`py-8 px-6 overflow-hidden ${isDark ? "bg-black" : "bg-white"}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
                    <div className="max-w-2xl">
                        <span className="text-[10px] uppercase tracking-[0.6em] text-neutral-500 mb-6 block">Capability Showcase</span>
                        <h2 className={`text-5xl md:text-8xl font-serif font-light leading-[0.9] ${isDark ? "text-white" : "text-black"}`}>
                            Engineered for <br />
                            <span className="italic font-extralight text-neutral-500">Peak Performance</span>
                        </h2>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={prev} className="w-16 h-16 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 group">
                            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                        <button onClick={next} className="w-16 h-16 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 group">
                            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="relative aspect-[21/9] min-h-[500px] w-full border border-white/5 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2"
                        >
                            {/* Visual Content */}
                            <div className={`relative flex items-center justify-center bg-gradient-to-br ${capabilities[index].color}`}>
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 1 }}
                                    className="text-center"
                                >
                                    <div className="text-8xl md:text-[12rem] font-serif font-light tracking-tighter text-white/5 leading-none">
                                        {capabilities[index].stat}
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.5em] text-neutral-400 -mt-10">
                                        {capabilities[index].label}
                                    </div>
                                </motion.div>
                                
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="w-96 h-96 border border-white/5 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 left-0 w-96 h-96 border border-white/5 rounded-full scale-75"
                                    />
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col justify-center p-12 md:p-24 space-y-8 bg-neutral-950/50 backdrop-blur-xl border-l border-white/5">
                                <div className="text-neutral-500">{capabilities[index].icon}</div>
                                <h3 className="text-4xl md:text-5xl font-serif text-white">{capabilities[index].title}</h3>
                                <p className="text-lg text-neutral-400 font-light leading-relaxed max-w-md">
                                    {capabilities[index].description}
                                </p>
                                <div className="pt-8">
                                    <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                                        <motion.div 
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "0%" }}
                                            transition={{ duration: 8, ease: "linear" }}
                                            className="absolute inset-0 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex gap-4 mt-12 justify-center">
                    {capabilities.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-[2px] transition-all duration-500 ${index === i ? "w-12 bg-white" : "w-4 bg-white/10"}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
