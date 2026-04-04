"use client";

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300 ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}>
      {/* Left Section: Visual/Branding */}
      <div className={`hidden lg:flex relative overflow-hidden items-center justify-center p-12 transition-colors duration-300 ${isDark ? "bg-zinc-900" : "bg-zinc-100"}`}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Luxury Stay"
            className={`w-full h-full object-cover transition-opacity duration-300 ${isDark ? "opacity-70 grayscale-[0.2]" : "opacity-80"}`}
          />
          <div className="absolute inset-0 bg-black/30 transition-colors duration-300" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="h-px w-12 mb-8 bg-white" />
          <h2 className="text-5xl font-serif tracking-tight mb-6 leading-tight text-white">Refining<br />Hospitality</h2>
          <p className="font-light leading-relaxed text-zinc-200">
            Experience the next generation of property management. Precision-engineered for efficiency, designed for the exceptional.
          </p>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <Suspense
            fallback={
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest animate-pulse text-center">
                Loading Interface...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
