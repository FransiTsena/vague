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
            <div ref={textRef} className="w-full max-w-7xl mx-auto px-4 overflow-hidden" lang={language}>
                {/* Minimalist Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <div className="max-w-2xl space-y-6">
                        <h2 className="story-line text-xs font-bold tracking-[0.3em] uppercase text-neutral-500">
                            {t("story.label")}
                        </h2>
                        <h3 className={`story-line text-4xl md:text-6xl font-serif font-light leading-tight ${language === "am" ? "leading-snug" : ""}`}>
                            {t("story.headline1")} <br />
                            <span className={isDark ? "text-neutral-500" : "text-neutral-400"}>{t("story.headline2")}</span>
                        </h3>
                    </div>
                    <div className="max-w-md">
                        <p className={`story-line text-base md:text-lg leading-relaxed font-light ${isDark ? "text-neutral-400" : "text-neutral-500"} ${language === "am" ? "text-sm" : ""}`}>
                            {t("story.description")}
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 story-line mb-20">
                    {/* Impact Statement - Left side */}
                    <div className="md:col-span-4 space-y-8">
                        <div className="pt-8 border-t border-neutral-800/10 dark:border-white/10">
                            <h4 className={`text-xl font-serif mb-4 ${isDark ? "text-white" : "text-black"}`}>
                                {t("story.impact.title")}
                            </h4>
                            <p className={`text-sm leading-relaxed font-light ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                                {t("story.impact.description")}
                            </p>
                        </div>

                        {/* Stats - Left side bottom */}
                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-800/10 dark:border-white/10">
                            {stats.slice(0, 2).map((stat) => (
                                <div key={stat.key}>
                                    <div className={`text-3xl font-serif mb-1 ${isDark ? "text-white" : "text-black"}`}>{t(stat.valueKey)}</div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">{t(stat.labelKey)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Room Showcase - Center/Right */}
                    <div className="md:col-span-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                            {roomNames.slice(0, 2).map((room, idx) => {
                                const details = roomDetails[room] ?? { image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800", priceKey: "" };
                                return (
                                    <div key={room} className={`relative group overflow-hidden rounded-2xl ${idx === 1 ? "md:mt-12" : ""}`}>
                                        <div className="aspect-[4/5] relative">
                                            <Image
                                                src={details.image}
                                                alt={room}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">{t("story.trust.price")}</p>
                                                <p className="text-white text-lg font-serif mb-2">{room}</p>
                                                <p className="text-white font-medium">{t(details.priceKey)}</p>
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
                    <div className="flex flex-wrap justify-between items-center gap-8 py-4">
                        {trustedCompanies.map((company) => (
                            <div 
                                key={company} 
                                className="h-6 relative w-24 md:w-32 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-pointer"
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
