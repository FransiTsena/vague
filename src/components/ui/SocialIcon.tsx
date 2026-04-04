"use client";

import { motion } from "framer-motion";
import { Send, Phone } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { siTiktok, siWhatsapp, siInstagram, siYoutube, } from "simple-icons";

interface SocialIconProps {
    platform: "instagram" | "telegram" | "whatsapp" | "x" | "tiktok" | "youtube" | "phone";
    href: string;
    className?: string;
}

const icons = {
    instagram: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d={siInstagram.path} />
        </svg>
    ),
    telegram: Send,
    whatsapp: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d={siWhatsapp.path} />
        </svg>
    ),
    tiktok: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d={siTiktok.path} />
        </svg>
    ),
    x: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    youtube: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d={siYoutube.path} />
        </svg>
    ),
    phone: Phone,
};

const platformColors = {
    instagram: "hover:text-pink-500",
    youtube: "hover:text-red-500",
    telegram: "hover:text-sky-400",
    whatsapp: "hover:text-green-500",
    tiktok: "hover:text-gray-900 dark:hover:text-white",
    x: "hover:text-white",
    phone: "hover:text-green-500",
};

export default function SocialIcon({ platform, href, className }: SocialIconProps) {
    const Icon = icons[platform];
    const { isDark } = useTheme();

    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative p-3 rounded-full border transition-all duration-300 ${platformColors[platform]} ${isDark ? "border-white/10 bg-white/5 text-neutral-400 hover:border-white/30 hover:bg-white/10" : "border-black/10 bg-white text-neutral-600 hover:border-black/30 hover:bg-neutral-100"} ${className}`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Follow us on ${platform}`}
        >
            <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
            >
                <Icon className="w-5 h-5" />
            </motion.div>
        </motion.a>
    );
}
