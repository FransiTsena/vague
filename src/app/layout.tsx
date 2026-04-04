import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ChatBot from "@/components/ui/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VAGUE Resort | Luxury Hotel & AI Dynamic Booking",
  description: "Discover VAGUE Resort: ocean-view suites, wellness experiences, fine dining, and AI-powered dynamic pricing for smarter bookings.",
  keywords: ["resort", "hotel", "luxury stay", "AI pricing", "dynamic booking", "Ethiopia", "Addis Ababa", "wellness", "vacation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${notoEthiopic.variable} antialiased bg-background text-foreground selection:bg-foreground selection:text-background`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <main>{children}</main>
            <ChatBot />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
