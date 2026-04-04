"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
    const textRef = useRef<HTMLDivElement>(null);
    const { t, language } = useLanguage();
    const { isDark } = useTheme();
    const trustedCompanies = t("story.trust.companies").split(", ");
    const roomNames = t("story.trust.rooms").split(", ");
    
    // Mapping for room names to images and prices (using translation keys for prices)
    const roomDetails: Record<string, { image: string; priceKey: string }> = {
        "Deluxe Ocean Suite": { image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop", priceKey: "story.room.deluxe.price" },
        "Royal Infinity Villa": { image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop", priceKey: "story.room.royal.price" },
        "Garden Terrace Room": { image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop", priceKey: "story.room.garden.price" },
        "Panoramic Loft": { image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000&auto=format&fit=crop", priceKey: "story.room.loft.price" },
        // Amharic keys
        "ዴሉክስ የባህር እይታ": { image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop", priceKey: "story.room.deluxe.price" },
        "ሮያል ኢንፊኒቲ ቪላ": { image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop", priceKey: "story.room.royal.price" },
        "ጋርደን ቴራስ": { image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop", priceKey: "story.room.garden.price" },
        "ፓኖራሚክ ሎፍት": { image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000&auto=format&fit=crop", priceKey: "story.room.loft.price" },
    };

    const companyLogos: Record<string, string> = {
        "TripAdvisor": "/photos/tripadvisor.svg",
        "Booking.com": "/photos/booking.svg",
        "Expedia": "/photos/Expedia_2012_logo.svg",
        "Traveloka": "/photos/Traveloka logo.svg",
        "Agoda": "/photos/Agoda_Logo_2022.svg",
        "Hotels.com": "/photos/Hotels.com_Logo_2023.svg",
    };

    const companyLoop = [...trustedCompanies, ...trustedCompanies, ...trustedCompanies].map((company, index) => ({
        name: company,
        logo: companyLogos[company] ?? "https://images.unsplash.com/photo-1594913785162-e678ac0570da?auto=format&fit=crop&q=80&w=100",
        id: `${company}-${index}`,
    }));

    useEffect(() => {
        const ctx = gsap.context(() => {
            const lines = textRef.current?.querySelectorAll(".story-line");

            if (lines) {
                gsap.from(lines, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: textRef.current,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse",
                    },
                });
            }
        }, textRef);

        return () => ctx.revert();
    }, []);

    const stats = [
        { key: "story.stat1", valueKey: "story.stat1.value", labelKey: "story.stat1.label" },
        { key: "story.stat2", valueKey: "story.stat2.value", labelKey: "story.stat2.label" },
        { key: "story.stat3", valueKey: "story.stat3.value", labelKey: "story.stat3.label" },
    ];

    return (
        <Section id="story" className={isDark ? "bg-black text-white" : "bg-white text-black"}>
            <div ref={textRef} className="w-full max-w-7xl mx-auto overflow-hidden" lang={language}>
                {/* Minimalist Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 md:gap-12 mb-12 md:mb-32">
                    <div className="max-w-3xl space-y-6 md:space-y-8">
                        <h2 className="story-line text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase text-neutral-500">
                            {t("story.label")}
                        </h2>
                        <h3 className={`story-line text-4xl sm:text-5xl md:text-7xl font-serif font-light leading-tight md:leading-none ${language === "am" ? "leading-snug" : ""}`}>
                            {t("story.headline1")} <br />
                            <span className={`italic ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{t("story.headline2")}</span>
                        </h3>
                    </div>
                    <div className="max-w-md md:pb-4 border-l-2 md:border-l-0 border-neutral-800/10 dark:border-white/5 pl-6 md:pl-0">
                        <p className={`story-line text-base md:text-xl leading-relaxed font-light ${isDark ? "text-neutral-300" : "text-neutral-500"} ${language === "am" ? "text-sm" : ""}`}>
                            {t("story.description")}
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 story-line mb-16 md:mb-32">
                    {/* Impact Statement - Left side */}
                    <div className="md:col-span-12 lg:col-span-4 space-y-8 md:space-y-12">
                        <div className="pt-6 md:pt-8 border-t border-neutral-800/20 dark:border-white/10">
                            <h4 className={`text-xl md:text-2xl font-serif font-light mb-4 md:mb-6 tracking-wide ${isDark ? "text-white" : "text-black"}`}>
                                {t("story.impact.title")}
                            </h4>
                            <p className={`text-sm md:text-base leading-relaxed font-light ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                                {t("story.impact.description")}
                            </p>
                        </div>

                        {/* Stats - Left side bottom */}
                        <div className="grid grid-cols-2 gap-8 md:gap-12 pt-6 md:pt-8 border-t border-neutral-800/20 dark:border-white/10">
                            {stats.slice(0, 2).map((stat) => (
                                <div key={stat.key}>
                                    <div className={`text-3xl md:text-5xl font-serif font-light mb-1 md:mb-2 ${isDark ? "text-white" : "text-black"}`}>{t(stat.valueKey)}</div>
                                    <div className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-neutral-500 font-medium">{t(stat.labelKey)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Room Showcase - Center/Right */}
                    <div className="md:col-span-12 lg:col-span-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-12 h-full">
                            {roomNames.slice(0, 2).map((room, idx) => {
                                const details = roomDetails[room] ?? { image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800", priceKey: "" };
                                return (
                                    <div key={room} className={`relative group overflow-hidden ${idx === 1 ? "sm:mt-12 lg:mt-20" : ""}`}>
                                        <div className="aspect-[4/5] sm:aspect-[3/4] relative overflow-hidden">
                                            <Image
                                                src={details.image}
                                                alt={room}
                                                fill
                                                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                                            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 overflow-hidden">
                                                <p className="text-white/40 text-[8px] sm:text-[9px] uppercase tracking-[0.3em] mb-1 sm:mb-2 transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">{t("story.trust.price")}</p>
                                                <p className="text-white text-xl sm:text-2xl font-serif font-light mb-2 sm:mb-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-200">{room}</p>
                                                <p className="text-white text-xs sm:text-sm font-light tracking-widest transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-300">{t(details.priceKey)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Minimalist Trust Bar */}
                <div className="story-line pt-12 border-t border-neutral-800/10 dark:border-white/10">
                    <div className="flex flex-wrap justify-center md:justify-between items-center gap-10 py-4 overflow-hidden">
                        {trustedCompanies.map((company) => (
                            <div 
                                key={company} 
                                className={`h-8 relative w-24 md:w-32 transition-all duration-700 cursor-pointer ${isDark ? "opacity-60 hover:opacity-100 brightness-0 invert" : "opacity-40 hover:opacity-100"}`}
                            >
                                <Image
                                    src={companyLogos[company] ?? "https://images.unsplash.com/photo-1594913785162-e678ac0570da?auto=format&fit=crop&q=80&w=100"}
                                    alt={company}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    );
}
