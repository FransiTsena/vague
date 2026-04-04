"use client";

import Link from "next/link";
import Image from "next/image";
import SocialIcon from "@/components/ui/SocialIcon";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function Footer() {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();

    return (
        <footer className={`py-16 border-t ${isDark ? "bg-neutral-950 text-white border-white/10" : "bg-neutral-100 text-black border-black/10"}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className={`inline-flex items-center gap-2 md:gap-4 text-xl md:text-2xl font-bold tracking-tighter ${isDark ? "text-white" : "text-black"}`}>
                            <span className="inline-flex h-12 md:h-16 w-auto shrink-0 items-center" aria-hidden="true">
                                <Image
                                    src="/photos/522839df-db7c-4505-b8b4-13a635e7de4d_removalai_preview.png"
                                    alt="Resort Logo"
                                    width={120}
                                    height={120}
                                    className="h-full w-auto object-contain"
                                    priority
                                />
                            </span>
                            <span>
                                <span className="block leading-none text-3xl">VAGUE</span>
                                <span className={`block leading-none text-sm font-light tracking-[0.2em] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                                    RESORT
                                </span>
                            </span>
                        </Link>
                        <p className={`text-xs uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-700"}`} lang={language}>
                            {t("footer.improvement")}
                        </p>
                        <p className={`text-sm max-w-xs ${isDark ? "text-neutral-400" : "text-neutral-600"}`} lang={language}>
                            {t("footer.tagline")}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4" lang={language}>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                            {language === "en" ? "Quick Links" : "ፈጣን ማገናኛዎች"}
                        </h4>
                        <nav className="flex flex-col space-y-2">
                            <Link href="/#services" className={`text-sm transition-colors ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-black"}`}>
                                {t("nav.services")}
                            </Link>
                            <Link href="/#gallery" className={`text-sm transition-colors ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-black"}`}>
                                {t("nav.gallery")}
                            </Link>
                            <Link href="/#contact" className={`text-sm transition-colors ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-black"}`}>
                                {t("nav.contact")}
                            </Link>
                            <Link href="/provenance" className={`text-sm transition-colors ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-black"}`}>
                                {language === "en" ? "Provenance" : "ፕሮቬናንስ"}
                            </Link>
                            <Link href="/training" className={`text-sm transition-colors ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-black"}`}>
                                {t("nav.training")}
                            </Link>
                        </nav>
                    </div>

                    {/* Social & Contact */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                            {language === "en" ? "Connect With Us" : "ያግኙን"}
                        </h4>
                        <div className="flex gap-3">
                            <SocialIcon platform="phone" href="tel:+251929945151" />
                            <SocialIcon platform="whatsapp" href="https://wa.me/251929945151" />
                            <SocialIcon platform="youtube" href="https://www.youtube.com/@kurifturesorts" />
                            <SocialIcon platform="tiktok" href="https://tiktok.com/@kuriftu.resorts" />
                        </div>
                        <p className="text-sm text-neutral-500 mt-6">
                            Addis Ababa, Ethiopia | Lakeside Road
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className={`mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? "border-white/10" : "border-black/10"}`}>
                    <p className="text-sm text-neutral-500" lang={language}>
                        © {new Date().getFullYear()} VAGUE Resort. {t("footer.rights")}
                    </p>
                  
                </div>
            </div>
        </footer>
    );
}
