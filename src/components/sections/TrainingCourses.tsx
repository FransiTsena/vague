"use client";

import Section from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Clock, BarChart3 } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TrainingCourses() {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();
    const sectionRef = useRef<HTMLElement>(null);
    const coursesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !coursesRef.current) return;

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<HTMLElement>(".course-card");

            if (!cards.length) return;

            gsap.set(cards, { opacity: 1, y: 0 });

            gsap.from(cards, {
                scrollTrigger: {
                    trigger: coursesRef.current,
                    start: "top 80%",
                    once: true,
                },
                opacity: 0,
                y: 50,
                stagger: 0.2,
                duration: 0.8,
                ease: "power3.out",
                immediateRender: false,
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const courses = [
        {
            id: "01",
            titleKey: "training.course.pro",
            descKey: "training.course.pro.desc",
            durationKey: "training.course.pro.duration",
            levelKey: "training.course.pro.level",
            featured: true,
        },
        {
            id: "02",
            titleKey: "training.course.basic",
            descKey: "training.course.basic.desc",
            durationKey: "training.course.basic.duration",
            levelKey: "training.course.basic.level",
            featured: true,
        },
        {
            id: "03",
            titleKey: "training.course.intermediate",
            descKey: "training.course.intermediate.desc",
            durationKey: "training.course.intermediate.duration",
            levelKey: "training.course.intermediate.level",
            featured: true,
        },
        {
            id: "04",
            titleKey: "training.course.zero2hero",
            descKey: "training.course.zero2hero.desc",
            durationKey: "training.course.zero2hero.duration",
            levelKey: "training.course.zero2hero.level",
            featured: false,
        },
    ];

    return (
        <Section
            ref={sectionRef}
            id="training-courses"
            className={isDark ? "bg-[#0a0a0a] text-white" : "bg-neutral-50 text-black"}
        >
            <div className="max-w-7xl mx-auto px-8" lang={language}>
                <div className={`flex flex-col md:flex-row justify-between items-end mb-24 border-b pb-12 ${isDark ? "border-white/10" : "border-black/5"}`}>
                    <h2 className="text-5xl md:text-7xl font-serif tracking-tight">
                        {t("training.courses.title1")} <span className={isDark ? "text-neutral-600" : "text-neutral-400"}>{t("training.courses.title2")}</span>
                    </h2>
                    <p className={`max-w-xs mt-6 md:mt-0 text-[10px] font-mono uppercase tracking-[0.2em] leading-relaxed ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                        {t("training.courses.subtitle")}
                    </p>
                </div>

                <div ref={coursesRef} className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className={`course-card group p-12 transition-all ${isDark
                                ? "bg-[#0a0a0a] hover:bg-neutral-900"
                                : "bg-neutral-50 hover:bg-white"
                                }`}
                        >
                            {/* Course Number and Badge */}
                            <div className="flex justify-between items-baseline mb-12">
                                <span className={`text-[10px] font-mono tracking-widest ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                    [{course.id}]
                                </span>
                                {course.featured && (
                                    <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? "text-white" : "text-black"}`}>
                                        {t("training.badge.popular")}
                                    </span>
                                )}
                            </div>

                            {/* Course Title */}
                            <h3 className="text-3xl font-serif mb-6">{t(course.titleKey)}</h3>

                            {/* Course Description */}
                            <p className={`mb-12 text-sm leading-relaxed font-light min-h-[4.5rem] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                                {t(course.descKey)}
                            </p>

                            {/* Course Meta */}
                            <div className={`flex items-center gap-8 pt-8 border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Duration</span>
                                    <span className="text-xs font-medium tracking-wide italic">{t(course.durationKey)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Level</span>
                                    <span className="text-xs font-medium tracking-wide italic">{t(course.levelKey)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
