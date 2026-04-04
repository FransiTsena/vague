"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Menu, X, Settings, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
    const router = useRouter();
    const { data: session } = useSession();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t, language } = useLanguage();
    const { isDark } = useTheme();
    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!mobileMenuOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (mobileMenuRef.current?.contains(target)) {
                return;
            }
            if (mobileMenuButtonRef.current?.contains(target)) {
                return;
            }
            setMobileMenuOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [mobileMenuOpen]);

    const navItems = [
        { key: "nav.story", href: "/#story" },
        { key: "nav.rooms", href: "/rooms" },
        { key: "nav.services", href: "/#services" },
        { key: "nav.gallery", href: "/gallery" },
        { key: "nav.provenance", href: "/provenance" },
        { key: "nav.training", href: "/training" },
        { key: "nav.contact", href: "/#contact" },
    ];

    const handleBookClick = () => {
        router.push("/booking");
        setMobileMenuOpen(false);
    };

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-12",
                scrolled
                    ? isDark ? "bg-black py-3" : "bg-white py-3"
                    : "bg-transparent py-4"
            )}
        >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
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

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8" lang={language}>
                    {navItems.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={`text-sm font-medium transition-colors ${isDark ? "text-neutral-300 hover:text-white" : "text-neutral-600 hover:text-black"}`}
                        >
                            {t(item.key)}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Controls */}
                <div className="hidden md:flex items-center gap-3">
                    {session ? (
                        <>
                            <Link href="/admin">
                                <Button variant="outline" className="p-2 aspect-square flex items-center justify-center" title="Dashboard">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                className="p-2 aspect-square flex items-center justify-center group relative cursor-pointer" 
                                title={`Logged in as ${session.user?.name}`}
                            >
                                <User className="w-4 h-4" />
                                <span className="absolute -bottom-8 right-0 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {session.user?.name}
                                </span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="p-2 aspect-square flex items-center justify-center text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20" 
                                onClick={() => signOut({ redirect: true })}
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <Link href="/admin">
                            <Button variant="outline" className="p-2 aspect-square flex items-center justify-center" aria-label="Admin Login">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </Link>
                    )}
                    <ThemeToggle />
                    <Button variant="primary" className="px-6 py-2 text-xs" onClick={handleBookClick}>
                        {t("cta.book")}
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`md:hidden p-2 ${isDark ? "text-white" : "text-black"}`}
                    aria-label="Toggle menu"
                    ref={mobileMenuButtonRef}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`md:hidden border-t mt-4 ${isDark ? "bg-black/95 border-white/10" : "bg-white border-black/10"}`}
                        ref={mobileMenuRef}
                    >
                        <nav className="flex flex-col py-6 px-4 space-y-4" lang={language}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-lg font-medium transition-colors py-2 ${isDark ? "text-neutral-300 hover:text-white" : "text-neutral-600 hover:text-black"}`}
                                >
                                    {t(item.key)}
                                </Link>
                            ))}
                            <div className={`flex flex-col gap-4 pt-4 border-t ${isDark ? "border-white/10" : "border-black/10"}`}>
                                {session ? (
                                    <>
                                        <div className="px-2 py-2 mb-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Authenticated Personnel</p>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">{session.user?.name}</p>
                                        </div>
                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 text-lg font-medium transition-colors ${isDark ? "text-neutral-300 hover:text-white" : "text-neutral-600 hover:text-black"}`}>
                                            <Settings className="w-5 h-5 opacity-60" />
                                            Admin Dashboard
                                        </Link>
                                        <button 
                                            onClick={() => signOut({ redirect: true })}
                                            className="flex items-center gap-3 text-lg font-medium text-red-500 hover:text-red-600 transition-colors py-2 text-left"
                                        >
                                            <LogOut className="w-5 h-5 opacity-60" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 text-lg font-medium transition-colors ${isDark ? "text-neutral-300 hover:text-white" : "text-neutral-600 hover:text-black"}`}>
                                        <Settings className="w-5 h-5 opacity-60" />
                                        Personnel Portal
                                    </Link>
                                )}
                                <div className="flex items-center gap-4 pt-4">
                                    <ThemeToggle />
                                </div>
                            </div>
                            <Button variant="primary" className="w-full mt-4" onClick={handleBookClick}>
                                {t("cta.book")}
                            </Button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
