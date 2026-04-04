"use client";

import Section from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TrainingAbout() {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();
    const textRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const lines = textRef.current?.querySelectorAll(".training-line");

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

            gsap.from(".training-stat-item", {
                scrollTrigger: {
                    trigger: statsRef.current,
                    start: "top 80%",
                },
                opacity: 0,
                y: 50,
                stagger: 0.2,
                duration: 0.8,
                ease: "power3.out",
            });
        }, textRef);

        return () => ctx.revert();
    }, []);

    const stats = [
        {
            value: t("training.stats.students"),
            label: t("training.stats.students.label"),
        },
        {
            value: t("training.stats.success"),
            label: t("training.stats.success.label"),
        },
        {
            value: t("training.stats.projects"),
            label: t("training.stats.projects.label"),
        },
    ];

    return (
        <Section
            id="training-about"
            className={`min-h-[80vh] flex items-center ${isDark ? "bg-[#0a0a0a] text-white" : "bg-neutral-50 text-black"}`}
        >
            <div ref={textRef} className="max-w-4xl mx-auto text-left space-y-12 w-full px-8" lang={language}>
                <h2 className={`training-line text-[10px] font-mono tracking-[0.4em] uppercase ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
                    {t("training.about.label")}
                </h2>

                <div className="space-y-8">
                    <p className={`training-line text-4xl md:text-6xl font-serif tracking-tight leading-tight ${language === "am" ? "leading-snug" : ""}`}>
                        {t("training.about.headline")}
                    </p>

                    <div className="h-[1px] w-24 bg-neutral-800 dark:bg-neutral-200 training-line opacity-50" />

                    <p className={`training-line text-lg md:text-xl max-w-2xl leading-relaxed font-light ${isDark ? "text-neutral-400" : "text-neutral-600"} ${language === "am" ? "text-base md:text-lg" : ""}`}>
                        {t("training.about.description")}
                    </p>
                </div>

                <div ref={statsRef} className={`training-line grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t ${isDark ? "border-white/10" : "border-black/5"}`}>
                    {stats.map((stat, index) => (
                        <div key={index} className="training-stat-item text-left">
                            <div className={`text-4xl font-serif mb-2 ${isDark ? "text-white" : "text-black"}`}>{stat.value}</div>
                            <div className={`text-[10px] font-mono uppercase tracking-[0.2em] ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Highlights */}
                <div className={`training-line grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 text-left`}>
                    <div className="space-y-4">
                        <h4 className="font-serif text-xl mb-2">{t("training.highlights.standard")}</h4>
                        <div className="h-[1px] w-8 bg-neutral-800 dark:bg-neutral-200 opacity-20" />
                        <p className={`text-sm leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                            {t("training.highlights.standard.desc")}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-serif text-xl mb-2">{t("training.highlights.handson")}</h4>
                        <div className="h-[1px] w-8 bg-neutral-800 dark:bg-neutral-200 opacity-20" />
                        <p className={`text-sm leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                            {t("training.highlights.handson.desc")}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-serif text-xl mb-2">{t("training.highlights.careers")}</h4>
                        <div className="h-[1px] w-8 bg-neutral-800 dark:bg-neutral-200 opacity-20" />
                        <p className={`text-sm leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                            {t("training.highlights.careers.desc")}
                        </p>
                    </div>
                </div>
            </div>
        </Section>
    );
}
