"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const { t, language } = useLanguage();
    const { isDark } = useTheme();

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Initial Reveal
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

            // Parallax Effect
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
            {/* Background */}
            <div
                ref={bgRef}
                className={`absolute inset-0 w-full h-full ${isDark ? "bg-black" : "bg-white"}`}
            >
                <div className="absolute inset-0 bg-[url('/photos/hero-background.webp')] bg-cover bg-center opacity-80" />
            </div>

            {/* Overlay for better text readability */}
            {isDark && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80" />
            )}

            {/* Content */}
            <div
                ref={textRef}
                className="relative z-10 text-center px-6 max-w-7xl mx-auto flex flex-col items-center gap-10"
                lang={language}
            >
                <div>
                    <h1 className={`hero-text text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-serif font-light tracking-tight leading-[1.1] md:leading-[0.9] mb-6 md:mb-8 ${isDark ? "text-white" : "text-black"}`}>
                        {t("hero.title1")} <br />
                        <span className={`italic font-light ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>{t("hero.title2")}</span>
                    </h1>
                    <p className={`hero-text text-base md:text-2xl max-w-2xl mx-auto font-light tracking-wide leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                        {t("hero.subtitle")}
                    </p>
                </div>
                
                <div className="hero-btn flex flex-col sm:flex-row gap-4 md:gap-6 mt-2 md:mt-4 w-full sm:w-auto px-4 sm:px-0">
                    <Button variant="primary" className="w-full sm:w-auto px-10 py-4 text-[10px] md:text-sm tracking-[0.2em] uppercase rounded-none border border-white" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                        {t("hero.cta1")}
                    </Button>
                    <Button variant="secondary" className="w-full sm:w-auto px-10 py-4 text-[10px] md:text-sm tracking-[0.2em] uppercase rounded-none border border-white/20" onClick={() => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" })}>
                        {t("hero.cta2")}
                    </Button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 ${isDark ? "text-white/30" : "text-black/30"}`}>
                <span className="text-[10px] uppercase tracking-[0.3em] vertical-text mb-2">Scroll</span>
                <div className="w-[1px] h-12 bg-current animate-pulse md:h-20" />
            </div>
        </section>
    );
}
