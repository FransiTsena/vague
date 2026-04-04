"use client";

import { createContext, useContext, useEffect, useCallback, useSyncExternalStore, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const listeners = new Set<() => void>();

function emitChange() {
    listeners.forEach((l) => l());
}

function getSystemTheme(): Theme {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
    }
    return "dark";
}

function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => { listeners.delete(callback); };
}

function getSnapshot(): Theme {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("vague-theme");
    if (saved === "dark" || saved === "light") return saved;
    return getSystemTheme();
}

function getServerSnapshot(): Theme {
    return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
            root.style.colorScheme = "dark";
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
            root.style.colorScheme = "light";
        }
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (!localStorage.getItem("vague-theme")) {
                emitChange();
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = useCallback(() => {
        const next = theme === "dark" ? "light" : "dark";
        localStorage.setItem("vague-theme", next);
        emitChange();
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
