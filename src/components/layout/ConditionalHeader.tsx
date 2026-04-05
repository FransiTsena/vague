"use client";

import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isPlatformPage = pathname?.startsWith("/platform");

  if (isPlatformPage) {
    return null;
  }

  return <Header />;
}
