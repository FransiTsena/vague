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
            <div className="max-w-7xl mx-auto px-4 sm:px-0" lang={language}>
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b pb-8 ${isDark ? "border-white/10" : "border-black/10"}`}>
                    <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-left mb-6 md:mb-0">
                        {t("services.title1")} <br className="md:hidden" />
                        <span className={`italic ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{t("services.title2")}</span>
                    </h2>
                    <p className={`max-w-md text-left md:text-right text-sm md:text-base font-light leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                        {t("services.subtitle")}
                    </p>
                </div>

                {/* Hospitality Section */}
                <div className="mb-16 md:mb-20">
                    <div className="mb-8 md:mb-10">
                        <h3 className="text-xl md:text-3xl font-serif font-light tracking-wide mb-3">
                            {t("services.hospitality.title")}
                        </h3>
                        <p className={`text-xs md:text-base leading-relaxed max-w-2xl font-light ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
                            {t("services.hospitality.desc")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {hospitalitySubservices.map((service) => (
                            <div
                                key={service.id}
                                className={`group relative aspect-[4/5] overflow-hidden cursor-default transition-all duration-700 ${isDark ? "bg-neutral-900" : "bg-neutral-100"}`}
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                                    style={{ backgroundImage: `url(${service.image})` }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? "from-black/90 via-black/20" : "from-black/70 via-transparent"} to-transparent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
                                    <div className="relative overflow-hidden">
                                        <p className="text-white/40 text-[8px] md:text-[10px] uppercase tracking-[0.3em] mb-2 transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                            {service.id} — Hospitality
                                        </p>
                                        <h5 className="text-xl md:text-2xl font-serif font-light text-white mb-3">
                                            {t(service.titleKey)}
                                        </h5>
                                        <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100 line-clamp-3 md:line-clamp-none">
                                            {t(service.descKey)}
                                        </p>
                                    </div>
                                    
                                    <div 
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent("select-interest", { detail: service.interestValue }));
                                            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                        className="mt-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer group/link w-fit"
                                    >
                                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Inquire Now</span>
                                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other Services Section */}
                <div className="md:mt-32">
                  <h4 className={`text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium mb-10 md:mb-12 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                    Featured Amenities
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
                    {otherServices.map((service) => (
                      <div
                        key={service.id}
                        className="group flex flex-col"
                      >
                        <div className="relative aspect-[16/10] md:aspect-video overflow-hidden mb-6 md:mb-8 grayscale hover:grayscale-0 transition-all duration-1000">
                          <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                              style={{ backgroundImage: `url(${service.image})` }}
                          />
                          <div className={`absolute inset-0 ${isDark ? "bg-black/20" : "bg-white/10"} group-hover:bg-transparent transition-colors duration-700`} />
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                          <div className="mb-6">
                              <h5 className="text-xl md:text-2xl font-serif font-light mb-3 md:mb-4">
                                  {t(service.titleKey)}
                              </h5>
                              <p className={`text-sm md:text-base leading-relaxed font-light ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                                  {t(service.descKey)}
                              </p>
                          </div>
                          <div 
                              onClick={() => {
                                  window.dispatchEvent(new CustomEvent("select-interest", { detail: service.interestValue }));
                                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className={`inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-medium cursor-pointer group/link ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-black"} transition-colors`}
                          >
                              Plan Experience
                              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
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
