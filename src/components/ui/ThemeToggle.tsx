"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative p-2 rounded-full border border-foreground/20 hover:border-foreground/40 transition-all duration-300"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 0 : 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {theme === "dark" ? (
                    <Moon className="w-4 h-4 text-foreground" />
                ) : (
                    <Sun className="w-4 h-4 text-foreground" />
                )}
            </motion.div>
        </motion.button>
    );
}
