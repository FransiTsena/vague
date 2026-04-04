"use client";

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-700 ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Left Section: Visual/Branding */}
      <div className={`lg:flex-1 relative overflow-hidden flex items-center justify-center p-12 transition-colors duration-700 ${isDark ? "bg-black" : "bg-neutral-50"}`}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=90" 
            alt="VAGUE Luxury Heritage"
            className={`w-full h-full object-cover transition-all duration-1000 ${isDark ? "opacity-50 grayscale hover:grayscale-0 hover:scale-105" : "opacity-80 hover:scale-105"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-xl text-center lg:text-left">
          <div className="flex items-center gap-3 mb-10 opacity-60 justify-center lg:justify-start">
            <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white font-mono">Core Operating System</span>
          </div>
          
          <h2 className="font-serif text-6xl md:text-8xl font-light tracking-tight leading-[1.1] text-white mb-10">
            Unified <span className="italic text-neutral-400">Identity</span>
          </h2>
          
          <div className="h-[1px] w-24 bg-white/30 mb-10 hidden lg:block" />
          
          <p className="font-light leading-relaxed text-neutral-200 text-sm md:text-base max-w-md mx-auto lg:mx-0">
            Secure executive access to the VAGUE property management suite. Performance metrics, guest intelligence, and archival provenance unified under one signature.
          </p>
        </div>

        <div className="absolute bottom-12 left-12 hidden lg:block">
           <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Property Code: VAGUE-OS-2.0</span>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-transparent">
        <div className="w-full max-w-[420px] relative">
          <div className="absolute -left-12 top-0 h-full w-[1px] bg-neutral-100 dark:bg-white/5 hidden xl:block" />
          <Suspense
            fallback={
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest animate-pulse text-center font-mono">
                Establishing Secure Link...
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
