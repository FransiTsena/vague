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
    <div className="w-full animate-in fade-in duration-1000">
      <div className="mb-12">
        <h1 className={`text-3xl font-serif tracking-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>Personnel Access</h1>
        <p className={`text-xs uppercase tracking-widest ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Provide credentials to continue</p>
      </div>

      <div className="relative">
        <div className={`mb-12 p-6 shadow-sm border rounded-xl transition-colors duration-300 ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100"}`}>
          <div className="flex items-center justify-between mb-4">
             <p className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Quick Access Credentials</p>
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
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${isDark ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/10" : "border-blue-500/30 text-blue-500 hover:bg-blue-500/5"}`}
             >
                Initial Seed API
             </button>
          </div>
          <div className="flex flex-col gap-4">
            <button 
              type="button"
              onClick={() => { setEmail("gm@hotel.local"); setPassword("changeme"); }}
              className="group flex justify-between items-center hover:opacity-70 transition-opacity"
            >
              <div className="text-left">
                <span className={`block text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>General Manager</span>
                <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">gm@hotel.local / changeme</span>
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>Use</span>
            </button>
            <div className={`h-px ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            <button 
              type="button"
              onClick={() => { setEmail("head.culinarybanquets@hotel.local"); setPassword("changeme"); }}
              className="group flex justify-between items-center hover:opacity-70 transition-opacity"
            >
              <div className="text-left">
                <span className={`block text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>Department Head</span>
                <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">head.culinarybanquets@hotel.local</span>
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>Use</span>
            </button>
            <div className={`h-px ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            <button 
              type="button"
              onClick={() => { setEmail("staff.bellman@hotel.local"); setPassword("changeme"); }}
              className="group flex justify-between items-center hover:opacity-70 transition-opacity"
            >
              <div className="text-left">
                <span className={`block text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>Bell Service (Staff)</span>
                <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">staff.bellman@hotel.local</span>
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>Use</span>
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-8 p-4 text-[10px] font-bold uppercase tracking-widest text-center border rounded-lg ${isDark ? "bg-red-950/30 text-red-400 border-red-900" : "bg-red-50 text-red-600 border-red-100"}`}>
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3">
            <label htmlFor="email" className={`block text-[10px] uppercase tracking-widest font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
              className={`w-full h-12 border focus:border-zinc-900 dark:focus:border-white rounded-lg transition-all text-sm px-4 outline-none ${isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"}`}
              placeholder="name@hotel.local"
            />
          </div>
          
          <div className="space-y-3">
            <label htmlFor="password" className={`block text-[10px] uppercase tracking-widest font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
              className={`w-full h-12 border focus:border-zinc-900 dark:focus:border-white rounded-lg transition-all text-sm px-4 outline-none ${isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"}`}
              placeholder="••••••••"
            />
          </div>

          <button 
              type="submit" 
              disabled={pending} 
              className={`w-full h-14 disabled:opacity-50 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold rounded-lg ${isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
          >
            {pending ? "Authenticating" : "Enter Dashboard"}
            {!pending && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
