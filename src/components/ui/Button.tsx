"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", ...props }, ref) => {
        const { isDark } = useTheme();
        
        return (
            <button
                ref={ref}
                className={cn(
                    "relative inline-flex items-center justify-center px-8 py-3 text-sm font-semibold tracking-widest uppercase transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
                    {
                        [isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"]: variant === "primary",
                        [isDark ? "bg-transparent text-white border border-white hover:bg-white hover:text-black" : "bg-transparent text-black border border-black hover:bg-black hover:text-white"]: variant === "secondary",
                        [isDark ? "bg-transparent text-white border border-white/20 hover:border-white" : "bg-transparent text-black border border-black/20 hover:border-black"]: variant === "outline",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export default Button;
