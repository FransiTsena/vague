"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, QrCode, GalleryHorizontalEnd, TrendingUp } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const adminNavItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    tag: "Overview"
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: TrendingUp,
    tag: "Intelligence"
  },
  {
    href: "/admin/scheduling",
    label: "Scheduling",
    icon: Users,
    tag: "Personnel"
  },
  {
    href: "/admin/provenance",
    label: "Provenance",
    icon: QrCode,
    tag: "Archive"
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    icon: GalleryHorizontalEnd,
    tag: "Media"
  },
];

export default function AdminSidebar() {
  const { isDark } = useTheme();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-24 md:top-32 h-[calc(100vh-96px)] md:h-[calc(100vh-128px)] w-64 border-r transition-colors duration-700 ${
        isDark
          ? "bg-black border-white/10"
          : "bg-white border-neutral-100"
      } overflow-y-auto`}
    >
      <nav className="flex flex-col p-6 space-y-2">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-500 ${
                active
                  ? isDark
                    ? "bg-white/10 text-white"
                    : "bg-neutral-100 text-neutral-900"
                  : isDark
                  ? "text-neutral-400 hover:text-white hover:bg-white/5"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-light ${active ? "font-medium" : ""}`}>
                  {item.label}
                </p>
                <p
                  className={`text-[10px] font-mono tracking-[0.2em] uppercase opacity-50 ${
                    active ? "opacity-100" : ""
                  }`}
                >
                  {item.tag}
                </p>
              </div>
              {active && (
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isDark ? "bg-white" : "bg-neutral-900"
                  }`}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
