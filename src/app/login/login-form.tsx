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
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-12 w-full animate-in fade-in duration-1000">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-1 h-3 transition-colors ${isDark ? "bg-white" : "bg-black"}`} />
          <h1 className={`text-[10px] font-mono tracking-[0.5em] uppercase transition-colors ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
            Personnel Authentication
          </h1>
        </div>
        <p className={`font-serif text-4xl italic transition-colors ${isDark ? "text-white" : "text-black"}`}>
          Welcome Back.
        </p>
      </div>

      {error && (
        <div className={`p-4 text-[10px] font-mono uppercase tracking-widest text-center border rounded-none ${isDark ? "bg-red-950/30 text-red-400 border-red-900" : "bg-red-50 text-red-600 border-red-100"}`}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <div className="space-y-3 group">
          <label htmlFor="email" className={`text-[9.5px] font-mono tracking-[0.3em] uppercase transition-colors ${isDark ? "text-neutral-500" : "text-neutral-400"} group-focus-within:text-neutral-100`}>
            Staff Identifier
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder="example@vague.com"
            required
            className={`w-full bg-transparent border-b transition-all duration-300 py-3 outline-none focus:border-neutral-500 font-serif text-lg rounded-none ${isDark ? "border-neutral-800 text-white" : "border-neutral-200 text-black shadow-sm"}`}
          />
        </div>

        <div className="space-y-3 group">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className={`text-[9.5px] font-mono tracking-[0.3em] uppercase transition-colors ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
              Security Phrase
            </label>
            <a href="#" className={`text-[9px] font-mono uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity ${isDark ? "text-white" : "text-black"}`}>
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
            className={`w-full bg-transparent border-b transition-all duration-300 py-3 outline-none focus:border-neutral-500 font-serif text-lg rounded-none ${isDark ? "border-neutral-800 text-white" : "border-neutral-200 text-black shadow-sm"}`}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={`group mt-4 py-6 overflow-hidden transition-all duration-500 rounded-none border-none flex items-center justify-center gap-4 ${
            isDark 
            ? "bg-white text-black hover:bg-neutral-200" 
            : "bg-black text-white hover:bg-neutral-800"
          }`}
        >
          <span className="text-[11px] font-mono tracking-[0.5em] uppercase">
            {pending ? "Authenticating..." : "Authorize Access"}
          </span>
          {!pending && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className={`pt-12 border-t transition-all duration-700 ${isDark ? "border-neutral-800/50" : "border-neutral-100"}`}>
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3 opacity-40">
              <div className="w-1.5 h-px bg-current" />
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase">Quick Access</span>
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
              className={`text-[8px] font-mono uppercase tracking-widest px-3 py-1 border transition-all ${isDark ? "border-amber-500/20 text-amber-500/50 hover:border-amber-500 hover:text-amber-500" : "border-blue-500/20 text-blue-500/50 hover:border-blue-500 hover:text-blue-500"}`}
           >
              Initialize Node
           </button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {[
            { role: "General Manager", email: "gm@hotel.local", label: "System Root" },
            { role: "Dept Head", email: "head.culinarybanquets@hotel.local", label: "Operations" },
            { role: "Staff", email: "staff.bellman@hotel.local", label: "Service" }
          ].map((seed) => (
            <button
              key={seed.email}
              type="button"
              onClick={() => { setEmail(seed.email); setPassword("changeme"); }}
              className={`group flex items-center justify-between py-4 px-6 border text-left transition-all duration-500 hover:scale-[1.01] ${
                isDark 
                ? "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900" 
                : "border-neutral-100 bg-neutral-50/50 hover:border-neutral-200 hover:bg-white"
              }`}
            >
              <div>
                <span className={`block text-[8.5px] font-mono tracking-[0.2em] uppercase transition-opacity opacity-40 group-hover:opacity-100 mb-1 ${isDark ? "text-white" : "text-black"}`}>
                  {seed.role}
                </span>
                <span className={`block font-serif italic text-sm ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  {seed.label}
                </span>
              </div>
              <span className={`text-[9px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                Select
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
