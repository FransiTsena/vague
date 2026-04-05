"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export default function PlatformLandingHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const { t, language } = useLanguage();
    const { isDark } = useTheme();

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.from(bgRef.current, {
                scale: 1.2,
                duration: 2,
                ease: "power3.out",
            })
                .from(
                    ".hero-text",
                    {
                        y: 100,
                        opacity: 0,
                        duration: 1,
                        stagger: 0.2,
                        ease: "power3.out",
                    },
                    "-=1.5"
                )
                .from(
                    ".hero-btn",
                    {
                        y: 20,
                        opacity: 0,
                        duration: 0.8,
                        ease: "power3.out",
                    },
                    "-=0.5"
                );

            gsap.to(bgRef.current, {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className={`relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center pt-24 pb-32 ${isDark ? "bg-black" : "bg-white"}`}
        >

            <div
                ref={bgRef}
                className={`absolute inset-0 w-full h-full ${isDark ? "bg-black" : "bg-white"}`}
            >
                <div className="absolute inset-0 bg-[url('/photos/services/wenchi.jpg')] bg-cover bg-center opacity-40 scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? "from-black/90 via-black/40 to-black" : "from-white/90 via-white/40 to-white"}`} />
            </div>

            <div
                ref={textRef}
                className="relative z-10 text-center px-6 max-w-7xl mx-auto flex flex-col items-center gap-12"
                lang={language}
            >
                <div className="space-y-8">
                    <span className={`hero-text block text-[10px] md:text-xs uppercase tracking-[0.5em] font-light ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                        Next-Generation Hospitality
                    </span>
                    <h1 className={`hero-text text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-serif font-light tracking-tight leading-[1.0] mb-8 ${isDark ? "text-white" : "text-black"}`}>
                        {t("platform.hero.title1")} <br />
                        <span className={`italic font-light ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>{t("platform.hero.title2")}</span>
                    </h1>
                    <p className={`hero-text text-lg md:text-2xl max-w-3xl mx-auto font-light tracking-wide leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                        {t("platform.hero.subtitle")}
                    </p>
                </div>
                
                <div className="hero-btn flex flex-col sm:flex-row gap-6 mt-6 w-full sm:w-auto px-4 sm:px-0">
                    <Link href="/demo">
                        <Button variant="primary" className="w-full sm:w-auto px-12 py-5 text-[10px] md:text-xs tracking-[0.3em] uppercase rounded-none bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-500 shadow-2xl">
                            {t("platform.hero.cta1")}
                        </Button>
                    </Link>
                    <Button 
                        variant="secondary" 
                        className={`w-full sm:w-auto px-12 py-5 text-[10px] md:text-xs tracking-[0.3em] uppercase rounded-none border transition-all duration-500 ${isDark ? "border-white/20 text-white hover:border-white/50" : "border-black/20 text-black hover:border-black/50"}`}
                        onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                    >
                        {t("platform.hero.cta2")}
                    </Button>
                </div>
            </div>

            <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 ${isDark ? "text-white/30" : "text-black/30"}`}>
                <span className="text-[10px] uppercase tracking-[0.3em] vertical-text mb-2">Discover</span>
                <div className="w-[1px] h-12 bg-current animate-pulse md:h-20" />
            </div>
        </section>
    );
}
