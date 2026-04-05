"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function LoginForm() {
  const router = useRouter();
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const callbackUrl = "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    
    // BACKDOOR for hackathon demo: bypass DB check for specific accounts
    if (password === "changeme") {
        if (email === "gm@hotel.local" || email === "head.culinarybanquets@hotel.local" || email === "staff.bellman@hotel.local") {
            const role = email.includes("gm") ? "ADMIN" : email.includes("head") ? "DEPT_HEAD" : "STAFF";
            // We still try to sign in normally, but if DB fails or is slow, we can mock it here
            // However, next-auth needs a real return. Let's stick to the form logic but ensure the seed runs or provides feedback.
        }
    }

    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid credentials. If this is a new setup, ensure the database is seeded.");
      return;
    }

    if (res?.ok) {
        window.location.href = callbackUrl;
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-3 transition-colors ${isDark ? "bg-white" : "bg-black"}`} />
          <h1 className={`text-[10px] font-mono tracking-[0.5em] uppercase opacity-70 ${isDark ? "text-white" : "text-black"}`}>
            Personnel Authentication
          </h1>
        </div>
        <p className={`font-serif text-3xl italic ${isDark ? "text-white" : "text-black"}`}>
          Welcome Back.
        </p>
      </div>

      <div className={`py-4 lg:py-6 border-y ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-px bg-amber-500" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-500 font-bold">Quick Access</span>
           </div>
           <button 
              onClick={async () => {
                  setPending(true);
                  try {
                      const res = await fetch("/api/seed/staff", { method: "POST" });
                      if (res.ok) alert("Staff accounts seeded successfully.");
                      else alert("Seeding failed. Check database connection.");
                  } catch (e) {
                      alert("Seeding error. Check network.");
                  }
                  setPending(false);
              }}
              className={`text-[8px] font-mono uppercase tracking-widest px-2 py-1 border rounded transition-all ${isDark ? "border-amber-500/20 text-amber-500/70 hover:border-amber-500 hover:text-amber-500" : "border-amber-500/30 text-amber-600 hover:bg-amber-50"}`}
           >
              Reset Seed
           </button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {[
            { role: "GM", email: "gm@hotel.local", label: "System Root" },
            { role: "Dept Head", email: "head.culinarybanquets@hotel.local", label: "Operations" },
          ].map((seed) => (
            <button
              key={seed.email}
              type="button"
              onClick={() => { setEmail(seed.email); setPassword("changeme"); }}
              className={`group flex items-center justify-between py-3 px-4 border text-left transition-all ${
                isDark 
                ? "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600 hover:bg-neutral-800" 
                : "border-neutral-200 bg-neutral-50/50 hover:border-black hover:bg-white"
              }`}
            >
              <div>
                <span className={`block text-[9px] font-mono tracking-widest uppercase font-bold ${isDark ? "text-white" : "text-black"}`}>
                  {seed.role}
                </span>
                <span className={`block text-[8px] font-mono opacity-50 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {seed.email}
                </span>
              </div>
              <span className={`text-[9px] font-mono tracking-widest uppercase p-1 border border-current rounded text-[8px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Auto-Fill
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 text-[10px] font-mono uppercase tracking-widest text-center bg-red-500 text-white font-bold">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="space-y-2 group">
          <label htmlFor="email" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder="example@vague.com"
            required
            className={`w-full bg-transparent border-b-2 transition-all py-2 outline-none font-sans text-base ${isDark ? "border-neutral-800 text-white focus:border-white" : "border-neutral-200 text-black focus:border-black"}`}
          />
        </div>

        <div className="space-y-2 group">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Password
            </label>
            <a href="#" className={`text-[9px] font-bold uppercase tracking-widest underline underline-offset-2 ${isDark ? "text-white" : "text-black"}`}>
              Forgot?
            </a>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required
            className={`w-full bg-transparent border-b-2 transition-all py-2 outline-none font-sans text-base ${isDark ? "border-neutral-800 text-white focus:border-white" : "border-neutral-200 text-black focus:border-black"}`}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={`group mt-2 py-4 flex items-center justify-center gap-3 transition-all ${
            isDark 
            ? "bg-white text-black hover:bg-neutral-200" 
            : "bg-black text-white hover:bg-neutral-800"
          }`}
        >
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase">
            {pending ? "Loading..." : "Login"}
          </span>
          {!pending && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
