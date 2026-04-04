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

function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => { listeners.delete(callback); };
}

function getSnapshot(): Theme {
    const saved = localStorage.getItem("vague-theme");
    if (saved === "dark" || saved === "light") return saved;
    return "light";
}

function getServerSnapshot(): Theme {
    return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    useEffect(() => {
        if (theme === "light") {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
        }
    }, [theme]);

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
