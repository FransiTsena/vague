"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  GalleryHorizontalEnd, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Settings,
  ShieldCheck,
  CalendarDays,
  UserPlus,
  BarChart3,
  Search,
  Plus
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  tag: string;
  subItems?: { href: string; label: string }[];
}

const adminNavItems: NavItem[] = [
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
    tag: "Intelligence",
    subItems: [
      { href: "/admin/analytics", label: "Intelligence Grid" },
      { href: "/admin/analytics/revenue", label: "Revenue Modeling" },
      { href: "/admin/analytics/occupancy", label: "Occupancy Trajectories" },
      { href: "/admin/analytics/guests", label: "Guest Predictive" }
    ]
  },
  {
    href: "/admin/scheduling",
    label: "Personnel",
    icon: Users,
    tag: "Operations",
    subItems: [
      { href: "/admin/scheduling", label: "Logistics Overview" },
      { href: "/admin/scheduling/roster", label: "Personnel Registry" },
      { href: "/admin/scheduling/shifts", label: "Shift Orchestration" }
    ]
  },
  {
    href: "/admin/provenance",
    label: "Provenance",
    icon: QrCode,
    tag: "Archive",
    subItems: [
      { href: "/admin/provenance", label: "Curation Overview" },
      { href: "/admin/provenance/collection", label: "Digital Archives" },
      { href: "/admin/provenance/certificates", label: "Security Signatures" }
    ]
  },
  {
    href: "/admin/gallery",
    label: "Media",
    icon: GalleryHorizontalEnd,
    tag: "Creative",
    subItems: [
      { href: "/admin/gallery", label: "Gallery Interface" },
      { href: "/admin/gallery/upload", label: "Asset Ingestion" },
      { href: "/admin/gallery/assets", label: "Library Assets" }
    ]
  },
];

export default function AdminSidebar() {
  const { isDark } = useTheme();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand active item's parent
  useEffect(() => {
    const activeParent = adminNavItems.find(item => 
      item.subItems?.some(sub => pathname.startsWith(sub.href)) || 
      (item.href !== "/admin" && pathname.startsWith(item.href))
    );
    if (activeParent && !expandedItems.includes(activeParent.href)) {
      setExpandedItems(prev => [...prev, activeParent.href]);
    }
  }, [pathname]);

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(i => i !== href) 
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const isSubActive = (href: string) => pathname === href;

  return (
    <aside
      className={`fixed left-0 top-24 md:top-32 h-[calc(100vh-96px)] md:h-[calc(100vh-128px)] w-64 border-r transition-all duration-700 ${
        isDark
          ? "bg-black border-white/10"
          : "bg-white border-neutral-100"
      } overflow-y-auto z-40`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Navigation Content */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isExpanded = expandedItems.includes(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.href} className="space-y-1">
                {hasSubItems ? (
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                      active
                        ? isDark
                          ? "bg-white/5 text-white"
                          : "bg-neutral-100 text-neutral-900"
                        : isDark
                        ? "text-neutral-500 hover:text-white hover:bg-white/5"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-110" : ""}`} />
                    <div className="flex-1 text-left min-w-0">
                      <span className={`text-sm font-light block truncate ${active ? "font-medium" : ""}`}>
                        {item.label}
                      </span>
                      <span className="text-[9px] font-mono tracking-widest uppercase opacity-40 group-hover:opacity-70 transition-opacity">
                        {item.tag}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                      active
                        ? isDark
                          ? "bg-white/5 text-white"
                          : "bg-neutral-100 text-neutral-900"
                        : isDark
                        ? "text-neutral-500 hover:text-white hover:bg-white/5"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-110" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-light block truncate ${active ? "font-medium" : ""}`}>
                        {item.label}
                      </span>
                      <span className="text-[9px] font-mono tracking-widest uppercase opacity-40 group-hover:opacity-70 transition-opacity">
                        {item.tag}
                      </span>
                    </div>
                  </Link>
                )}

                {/* Sub-items list with animation */}
                {hasSubItems && isExpanded && (
                  <div className="pl-9 pr-2 py-1 space-y-1 overflow-hidden transition-all duration-500 animate-in slide-in-from-top-2 fade-in">
                    {item.subItems!.map((sub) => {
                      const subActive = isSubActive(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block py-1.5 px-2 text-[13px] font-light rounded-md transition-all duration-300 border-l ${
                            subActive
                              ? isDark
                                ? "text-white border-white/40 bg-white/5 shadow-sm"
                                : "text-neutral-900 border-neutral-900 bg-neutral-100/50 shadow-sm"
                              : isDark
                              ? "text-neutral-500 border-transparent hover:text-neutral-300 hover:border-white/20 hover:bg-white/5"
                              : "text-neutral-500 border-transparent hover:text-neutral-800 hover:border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer info or profile settings could go here */}
        <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-neutral-100"}`}>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 text-xs font-light text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Infrastructure Settings</span>
          </Link>
          <div className="mt-4 flex items-center gap-3 px-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">Core v2.4.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
