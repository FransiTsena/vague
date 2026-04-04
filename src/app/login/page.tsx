"use client";

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-700 ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Left Section: Visual/Branding */}
      <div className="lg:w-[45%] xl:w-[50%] relative overflow-hidden flex items-center justify-center p-8 lg:p-12 transition-colors duration-700 bg-neutral-900 border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=90" 
            alt="VAGUE Luxury Heritage"
            className="w-full h-full object-cover opacity-60 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 max-w-xl text-center lg:text-left">
          <div className="flex items-center gap-3 mb-6 lg:mb-10 justify-center lg:justify-start">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white font-mono opacity-90">Core Operating System</span>
          </div>
          
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1] text-white mb-6 lg:mb-10">
            Unified <span className="italic text-neutral-400">Identity</span>
          </h2>
          
          <div className="h-[1px] w-24 bg-white/40 mb-10 hidden lg:block" />
          
          <p className="font-light leading-relaxed text-neutral-200 text-sm md:text-base max-w-sm mx-auto lg:mx-0 opacity-80">
            Secure executive access to the HMS property management suite. Performance metrics and guest intelligence unified.
          </p>
        </div>

        <div className="absolute bottom-8 left-8 hidden lg:block">
           <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">VAGUE-OS-2.0</span>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className={`flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 transition-colors duration-700 ${isDark ? "bg-black" : "bg-white"}`}>
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
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
