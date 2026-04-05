"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

export default function PlatformFeatures() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { t, language } = useLanguage();
    const { isDark } = useTheme();

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".feature-card", {
                y: 60,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                },
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const features = [
        {
            id: "pricing",
            title: t("platform.features.pricing.title"),
            description: t("platform.features.pricing.desc"),
            icon: (
                <svg className="w-12 h-12 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
        },
        {
            id: "scheduling",
            title: t("platform.features.scheduling.title"),
            description: t("platform.features.scheduling.desc"),
            icon: (
                <svg className="w-12 h-12 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            id: "provenance",
            title: t("platform.features.provenance.title"),
            description: t("platform.features.provenance.desc"),
            icon: (
                <svg className="w-12 h-12 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
        },
        {
            id: "analytics",
            title: t("platform.features.analytics.title"),
            description: t("platform.features.analytics.desc"),
            icon: (
                <svg className="w-12 h-12 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
    ];

    return (
        <section
            id="features"
            ref={containerRef}
            className={`py-64 px-6 overflow-hidden relative ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
            lang={language}
        >
            {/* Background Narrative Text */}
            <div className="absolute top-20 right-10 opacity-[0.02] select-none pointer-events-none">
                <span className="text-[12vw] font-serif italic whitespace-nowrap leading-none">Infrastructure & Logic</span>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-40 space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-[1px] bg-neutral-800" />
                        <span className={`text-[10px] md:text-xs uppercase tracking-[0.8em] font-medium ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                            Institutional Grade
                        </span>
                    </div>
                    <h2 className="text-6xl md:text-9xl font-serif font-light leading-[0.85] tracking-tight">
                        Platform <br />
                        <span className="italic font-extralight text-neutral-600">Architecture</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800/30 border border-white/5">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className={`feature-card group relative p-16 md:p-24 overflow-hidden transition-all duration-1000 ${
                                isDark 
                                ? "bg-black" 
                                : "bg-white"
                            }`}
                        >
                            {/* Subtle Radial Glow on Hover */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            
                            <div className="relative z-10 space-y-10 transition-transform duration-1000 group-hover:-translate-y-3">
                                <div className={`transition-all duration-1000 group-hover:scale-110 group-hover:text-white ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>
                                    {feature.icon}
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-3xl md:text-4xl font-serif tracking-wide italic font-light">
                                        {feature.title}
                                    </h3>
                                    <p className={`text-base md:text-lg leading-relaxed font-light max-w-sm transition-colors duration-1000 ${isDark ? "text-neutral-500 group-hover:text-neutral-300" : "text-neutral-400 group-hover:text-neutral-800"}`}>
                                        {feature.description}
                                    </p>
                                </div>
                                
                                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-4 group-hover:translate-y-0">
                                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 border-b border-white/10 pb-2">Technical Specification</span>
                                </div>
                            </div>

                            {/* Corner Accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] -rotate-45 translate-x-12 -translate-y-12 transition-transform duration-1000 group-hover:translate-x-8 group-hover:-translate-y-8" />
                            
                            {/* Animated Bottom Border */}
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-center" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
