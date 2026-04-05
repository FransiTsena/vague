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
            className={`py-48 px-6 overflow-hidden ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
            lang={language}
        >
            <div className="max-w-7xl mx-auto">
                <div className="mb-32 text-center">
                    <span className={`text-[10px] md:text-xs uppercase tracking-[0.6em] mb-8 block ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                        Institutional Grade Infrastructure
                    </span>
                    <h2 className="text-5xl md:text-8xl font-serif font-light leading-none">
                        {t("platform.features.title")}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-900 border border-neutral-800">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className={`feature-card group relative p-16 overflow-hidden transition-all duration-700 ${
                                isDark 
                                ? "bg-black" 
                                : "bg-white"
                            }`}
                        >
                            <div className={`absolute inset-0 bg-neutral-100 opacity-0 group-hover:opacity-5 transition-opacity duration-700 ${isDark ? "mix-blend-overlay" : ""}`} />
                            
                            <div className={`relative z-10 transition-transform duration-700 group-hover:-translate-y-2`}>
                                <div className={`mb-12 transition-colors duration-700 ${isDark ? "text-neutral-400 group-hover:text-white" : "text-neutral-500 group-hover:text-black"}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-serif mb-6 tracking-wide italic font-light">{feature.title}</h3>
                                <p className={`text-base md:text-lg leading-relaxed font-light max-w-md ${isDark ? "text-neutral-400 group-hover:text-neutral-200" : "text-neutral-500 group-hover:text-neutral-700"} transition-colors duration-700`}>
                                    {feature.description}
                                </p>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neutral-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-center" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
