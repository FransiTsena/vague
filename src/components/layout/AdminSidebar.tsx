"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  GalleryHorizontalEnd, 
  Activity,
  ChevronRight,
  Settings,
  ShieldCheck,
  Home,
  TrendingUp
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: Home,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/scheduling",
    label: "Staffing",
    icon: Users,
  },
  {
    href: "/admin/provenance",
    label: "Provenance",
    icon: QrCode,
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    icon: GalleryHorizontalEnd,
  },
  {
    href: "/admin/dynamic-pricing",
    label: "Dynamic Pricing",
    icon: TrendingUp,
  },
];

export default function AdminSidebar() {
  const { isDark } = useTheme();
  const pathname = usePathname();

  return (
    <aside className={`fixed left-0 top-0 bottom-0 w-64 border-r transition-colors duration-700 z-40 hidden md:block ${
      isDark 
        ? "bg-black border-white/10" 
        : "bg-white border-neutral-100"
    }`}>
      <div className="flex flex-col h-full pt-32 pb-10 px-6">
        <div className="mb-10 px-2 text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">
          Management
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-3 rounded-sm transition-all duration-300 ${
                  isActive 
                    ? (isDark ? "bg-white/5 text-white" : "bg-neutral-50 text-black")
                    : (isDark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-black")
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className={`text-xs font-medium tracking-wide transition-all duration-500 ${isActive ? "translate-x-1" : "group-hover:translate-x-1"}`}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-10 border-t border-neutral-100 dark:border-white/5">
          <div className="px-2 space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 opacity-40">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] font-bold tracking-[0.3em] uppercase">System Live</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                <span className="text-[8px] font-bold tracking-[0.3em] uppercase">Auth Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
