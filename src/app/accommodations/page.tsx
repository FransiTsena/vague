"use client";

import StayRegistration from "@/components/sections/StayRegistration";
import Footer from "@/components/layout/Footer";

export default function AccommodationsPage() {
    return (
        <div className="min-h-screen bg-black pt-20">
            <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">VAGUE Resort</p>
                <h1 className="mt-3 text-5xl md:text-7xl font-serif tracking-tight text-white underline decoration-amber-500/30 text-center">Smart Accommodations</h1>
            </div>
            <StayRegistration />
            <Footer />
        </div>
    );
}
