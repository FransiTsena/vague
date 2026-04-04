"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

export default function TrainingHero() {
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
                    ".training-hero-text",
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
                    ".training-hero-btn",
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

    const handleEnrollClick = () => {
        const contactSection = document.getElementById("contact");
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            window.location.href = "/#contact";
        }
    };

    return (
        <section
            ref={containerRef}
            className={`relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-12 md:pt-14 ${isDark ? "bg-black" : "bg-white"}`}
        >
            {/* Background */}
            <div
                ref={bgRef}
                className={`absolute inset-0 w-full h-full ${isDark ? "bg-neutral-900" : "bg-neutral-100"}`}
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540552989939-6880b99f44c9?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
            </div>

            {/* Overlay for better text readability */}
            {isDark && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            )}

            {/* Content */}
            <div
                ref={textRef}
                className="relative z-10 text-left px-8 max-w-7xl mx-auto flex flex-col items-start gap-12 w-full"
                lang={language}
            >
                <div className="space-y-4">
                  <span className="training-hero-text text-[10px] md:text-xs font-mono uppercase tracking-[0.5em] text-neutral-500 block">
                    {t("training.nav")}
                  </span>
                  <h1 className={`training-hero-text text-6xl md:text-8xl lg:text-[10rem] font-serif leading-[0.8] tracking-tighter ${isDark ? "text-white" : "text-black"}`}>
                      {t("training.hero.title1")} <br />
                      <span className={isDark ? "text-neutral-500" : "text-neutral-400"}>{t("training.hero.title2")}</span>
                  </h1>
                </div>
                
                <p className={`training-hero-text text-xl md:text-2xl max-w-2xl font-light tracking-wide leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    {t("training.hero.subtitle")}
                </p>
                <div className="training-hero-btn flex flex-col sm:flex-row gap-6 mt-4">
                    <Button 
                        variant="primary" 
                        onClick={handleEnrollClick}
                        className="rounded-none px-12 py-5 bg-black text-white dark:bg-white dark:text-black text-[10px] tracking-[0.4em] uppercase hover:scale-105 transition-transform"
                    >
                        {t("training.hero.cta")}
                    </Button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce ${isDark ? "text-white/50" : "text-black/50"}`}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
            </div>
        </section>
    );
}
