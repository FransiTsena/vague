"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();
    const { isDark } = useTheme();

    return (
        <button
            onClick={toggleLanguage}
            className={`relative flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-300 ${isDark ? "border-white/20 hover:border-white/40 text-white" : "border-black/20 hover:border-black/40 text-black"}`}
            aria-label={language === "en" ? "Switch to Amharic" : "Switch to English"}
        >
            <span
                className={`transition-opacity duration-200 ${language === "en" ? "opacity-100" : "opacity-50"}`}
            >
                EN
            </span>
            <span className={isDark ? "text-white/30" : "text-black/30"}>/</span>
            <span
                className={`transition-opacity duration-200 ${language === "am" ? "opacity-100" : "opacity-50"}`}
            >
                አማ
            </span>
            <motion.div
                className={`absolute inset-0 rounded-full border-2 ${isDark ? "border-white/0" : "border-black/0"}`}
                whileHover={{ borderColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
            />
        </button>
    );
}
