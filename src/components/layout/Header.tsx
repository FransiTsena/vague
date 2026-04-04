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
                                <Button variant="outline" className="flex items-center gap-2 px-3 py-2 h-auto" title="Dashboard">
                                    <Settings className="w-4 h-4" />
                                    <span className="text-[10px] uppercase tracking-widest font-medium">Dashboard</span>
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
                            <Button variant="outline" className="flex items-center gap-2 px-3 py-2 h-auto" aria-label="Admin Login">
                                <Settings className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest font-medium">Login</span>
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
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className={`fixed inset-0 top-0 left-0 w-full h-screen z-[60] overflow-y-auto px-6 py-20 flex flex-col ${isDark ? "bg-black" : "bg-white"}`}
                    >
                        {/* Close Button Inside Fullscreen Menu */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className={`absolute top-6 right-6 p-2 rounded-full border ${isDark ? "border-white/10 text-white" : "border-black/10 text-black"}`}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col h-full max-w-lg mx-auto w-full">
                            <div className="mb-12">
                                <span className={`block text-3xl font-bold tracking-tighter ${isDark ? "text-white" : "text-black"}`}>VAGUE</span>
                                <span className={`block text-sm font-light tracking-[0.2em] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>RESORT</span>
                            </div>

                            <nav className="flex flex-col space-y-6 mb-12" lang={language}>
                                {navItems.map((item, index) => (
                                    <motion.div
                                        key={item.key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`text-2xl font-serif italic transition-colors ${isDark ? "text-neutral-300 hover:text-white" : "text-neutral-600 hover:text-black"}`}
                                        >
                                            {t(item.key)}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className={`mt-auto pt-8 border-t space-y-8 ${isDark ? "border-white/10" : "border-black/10"}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <ThemeToggle />
                                        <span className={`text-xs uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                            {isDark ? "Dark Appearance" : "Light Appearance"}
                                        </span>
                                    </div>
                                    
                                    {session ? (
                                        <Button 
                                            variant="outline" 
                                            className="text-red-500 border-red-200" 
                                            onClick={() => signOut({ redirect: true })}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign Out
                                        </Button>
                                    ) : (
                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className="flex items-center gap-2">
                                                <Settings className="w-4 h-4" />
                                                Personnel Login
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {session && (
                                    <div className={`p-4 rounded-lg flex items-center gap-4 ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>Welcome Back</p>
                                            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>{session.user?.name}</p>
                                        </div>
                                    </div>
                                )}

                                <Button variant="primary" className="w-full py-6 text-sm tracking-[0.3em] uppercase" onClick={handleBookClick}>
                                    {t("cta.book")}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
