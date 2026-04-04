"use client";

import Section from "@/components/ui/Section";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function Services() {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();

    const hospitalitySubservices = [
        {
            id: "01",
            titleKey: "services.hospitality.comfort.title",
            descKey: "services.hospitality.comfort.desc",
            image: "/photos/services/royal-comfort.jpg",
            interestValue: "comfort",
        },
        {
            id: "02",
            titleKey: "services.hospitality.dining.title",
            descKey: "services.hospitality.dining.desc",
            image: "/photos/services/elite-dining.jpg",
            interestValue: "dining",
        },
        {
            id: "03",
            titleKey: "services.hospitality.pool.title",
            descKey: "services.hospitality.pool.desc",
            image: "/photos/services/infinity-pool.jpg",
            interestValue: "pool",
        },
        {
            id: "04",
            titleKey: "services.hospitality.garden.title",
            descKey: "services.hospitality.garden.desc",
            image: "/photos/services/garden-views.jpg",
            interestValue: "garden",
        },
        {
            id: "05",
            titleKey: "services.hospitality.spa.title",
            descKey: "services.hospitality.spa.desc",
            image: "/photos/services/spa-wellness.jpg",
            interestValue: "spa",
        },
        {
            id: "06",
            titleKey: "services.hospitality.stay.title",
            descKey: "services.hospitality.stay.desc",
            image: "/photos/services/luxury-stay.jpg",
            interestValue: "stay",
        },
    ];

    const otherServices = [
        {
            id: "01",
            titleKey: "services.wellness.title",
            descKey: "services.wellness.desc",
            image: "/photos/services/airport-transfers.jpg",
            interestValue: "wellness",
        },
        {
            id: "02",
            titleKey: "services.adventure.title",
            descKey: "services.adventure.desc",
            image: "/photos/services/conference-hosting.jpg",
            interestValue: "adventure",
        },
        {
            id: "03",
            titleKey: "services.events.title",
            descKey: "services.events.desc",
            image: "/photos/services/destination-events.jpg",
            interestValue: "events",
        },
    ];

    return (
        <Section id="services" className={isDark ? "bg-black text-white" : "bg-white text-black"}>
            <div className="max-w-7xl mx-auto" lang={language}>
                <div className={`flex flex-col md:flex-row justify-between items-center md:items-end mb-16 border-b pb-8 ${isDark ? "border-white/10" : "border-black/10"}`}>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-center md:text-left">
                        {t("services.title1")} <span className={isDark ? "text-neutral-500" : "text-neutral-400"}>{t("services.title2")}</span>
                    </h2>
                    <p className={`max-w-md mt-4 md:mt-0 text-center md:text-right ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                        {t("services.subtitle")}
                    </p>
                </div>

                {/* Hospitality Section */}
                <div className="mb-20">
                    <div className="mb-10">
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                            {t("services.hospitality.title")}
                        </h3>
                        <p className={`text-sm md:text-base leading-relaxed max-w-2xl ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                            {t("services.hospitality.desc")}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {hospitalitySubservices.map((service) => (
                            <div
                                key={service.id}
                                className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border transition-all duration-500 cursor-default ${isDark ? "bg-neutral-900 border-white/5 hover:border-white/20" : "bg-neutral-100 border-black/5 hover:border-black/20"}`}
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${service.image})` }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? "from-black/90 via-black/20" : "from-black/70 via-transparent"} to-transparent pointer-events-none`} />

                                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                                    <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full text-white/70 border border-white/30 bg-black/30">
                                            {service.id}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-end">
                                            <div className="max-w-[85%]">
                                                <h5 className="text-lg md:text-xl font-bold text-white mb-1 drop-shadow-lg">
                                                    {t(service.titleKey)}
                                                </h5>
                                                <p className="text-xs text-white/80 leading-relaxed translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 line-clamp-3">
                                                    {t(service.descKey)}
                                                </p>
                                            </div>
                                            <div 
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent("select-interest", { detail: service.interestValue }));
                                                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                                                }}
                                                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer hidden md:flex"
                                            >
                                                <ArrowUpRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other Services Section */}
                <div>
                  <h4 className={`text-xs uppercase tracking-[0.2em] font-semibold mb-8 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                    Featured Amenities
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {otherServices.map((service) => (
                      <div
                        key={service.id}
                        className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${isDark ? "bg-neutral-900 border-white/5 hover:border-white/20" : "bg-neutral-100 border-black/5 hover:border-black/20"}`}
                      >
                        <div className="flex flex-col h-full">
                          <div className="relative aspect-video overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: `url(${service.image})` }}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                          </div>
                          <div className="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <h5 className="text-xl font-bold mb-2">
                                    {t(service.titleKey)}
                                </h5>
                                <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                                    {t(service.descKey)}
                                </p>
                            </div>
                            <div 
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent("select-interest", { detail: service.interestValue }));
                                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer group/link ${isDark ? "text-white" : "text-black"}`}
                            >
                                Plan Experience
                                <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center group-hover/link:bg-current group-hover/link:text-white transition-all">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </Section>
    );
}
