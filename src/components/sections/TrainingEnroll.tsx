"use client";

import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function TrainingEnroll() {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();

    const handleEnrollClick = () => {
        const contactSection = document.getElementById("contact");
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            window.location.href = "/#contact";
        }
    };

    return (
        <Section
            id="training-enroll"
            className={isDark ? "bg-[#0a0a0a] text-white" : "bg-neutral-50 text-black"}
        >
            <div className="max-w-4xl mx-auto text-left border-l border-neutral-200 dark:border-neutral-800 pl-12 py-12" lang={language}>
                <h2 className="text-5xl md:text-8xl font-serif tracking-tighter mb-12">
                    {t("training.enrollment")}
                </h2>

                <p className={`text-xl md:text-2xl font-light leading-relaxed mb-16 max-w-2xl ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    {t("training.enrollment.subtitle")}
                </p>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <Button
                        variant="primary"
                        className="px-12 py-4 text-[10px] tracking-[0.3em] uppercase rounded-none bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity"
                        onClick={handleEnrollClick}
                    >
                        {t("training.enrollment.button")}
                    </Button>
                    <div className="flex flex-col gap-1 pt-2">
                        <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Next Cohort</span>
                        <span className="text-xs italic tracking-wide">Autumn/Winter 2026 Session</span>
                    </div>
                </div>
            </div>
        </Section>
    );
}
