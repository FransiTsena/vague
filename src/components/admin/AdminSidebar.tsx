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
  Plus,
  Clock
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
    href: "/admin/bookings",
    label: "Reservations",
    icon: CalendarDays,
    tag: "Operations",
    subItems: [
      { href: "/admin/bookings", label: "Guest Ledger" },
      { href: "/admin/rooms", label: "Room Inventory" }
    ]
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
    href: "/admin/scheduling/members",
    label: "Personnel",
    icon: Users,
    tag: "Workforce",
    subItems: [
      { href: "/admin/scheduling/members", label: "Registry" },
      { href: "/admin/scheduling/roster", label: "Availability" },
      { href: "/admin/scheduling/departments", label: "Departments" },
    ]
  },
  {
    href: "/admin/scheduling/shifts",
    label: "Scheduling",
    icon: Clock,
    tag: "Operations",
    subItems: [
      { href: "/admin/scheduling/shifts", label: "Shift Orchestration" },
      { href: "/admin/staffing", label: "Deployment Map" },
      { href: "/admin/scheduling/events", label: "Event Matrix" },
      { href: "/admin/scheduling", label: "Logistics Hub" },
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
  {
    href: "/admin/dynamic-pricing",
    label: "Dynamic Pricing",
    icon: TrendingUp,
    tag: "Yield"
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
      className={`fixed left-0 top-20 md:top-24 h-[calc(100vh-80px)] md:h-[calc(100vh-96px)] w-56 border-r transition-all duration-700 ${
        isDark
          ? "bg-black border-white/10"
          : "bg-white border-neutral-100"
      } overflow-y-auto z-40`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Navigation Content */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isExpanded = expandedItems.includes(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.href} className="space-y-0.5">
                {hasSubItems ? (
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={`group w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-300 ${
                      active
                        ? isDark
                          ? "bg-white/5 text-white"
                          : "bg-neutral-100 text-neutral-900"
                        : isDark
                        ? "text-neutral-500 hover:text-white hover:bg-white/5"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-transform duration-300 ${active ? "scale-105" : ""}`} />
                    <div className="flex-1 text-left min-w-0">
                      <span className={`text-[13px] font-light block truncate ${active ? "font-medium" : ""}`}>
                        {item.label}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                    ) : (
                      <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-300 ${
                      active
                        ? isDark
                          ? "bg-white/5 text-white"
                          : "bg-neutral-100 text-neutral-900"
                        : isDark
                        ? "text-neutral-500 hover:text-white hover:bg-white/5"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-transform duration-300 ${active ? "scale-105" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-[13px] font-light block truncate ${active ? "font-medium" : ""}`}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                )}

                {/* Sub-items list with animation */}
                {hasSubItems && isExpanded && (
                  <div className="pl-8 pr-1.5 py-0.5 space-y-0.5 overflow-hidden transition-all duration-500 animate-in slide-in-from-top-1 fade-in">
                    {item.subItems!.map((sub) => {
                      const subActive = isSubActive(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block py-1 px-2 text-[12px] font-light rounded-md transition-all duration-300 border-l ${
                            subActive
                              ? isDark
                                ? "text-white border-white/40 bg-white/5"
                                : "text-neutral-900 border-neutral-900 bg-neutral-100/50"
                              : isDark
                              ? "text-neutral-500 border-transparent hover:text-neutral-300 hover:border-white/20"
                              : "text-neutral-500 border-transparent hover:text-neutral-800 hover:border-neutral-200"
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
            className="flex items-center gap-2.5 px-2 py-1.5 text-[11px] font-light text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Infrastructure Settings</span>
          </Link>
          <div className="mt-2 flex items-center gap-2.5 px-2">
             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">Core v2.4.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
