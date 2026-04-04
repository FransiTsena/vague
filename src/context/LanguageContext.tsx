"use client";

import { createContext, useContext, ReactNode, useState, useCallback } from "react";

type Language = "en" | "am";

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Header
        "nav.story": "Story",
        "nav.rooms": "Rooms",
        "nav.accommodations": "Accommodations",
        "nav.services": "Services",
        "nav.gallery": "Gallery",
        "nav.provenance": "Provenance",
        "nav.training": "Training",
        "nav.contact": "Contact",
        "cta.book": "Book Your Stay",

        // Hero
        "hero.title1": "Escape to",
        "hero.title2": "VAGUE Resort",
        "hero.subtitle": "Ocean-view suites, curated experiences, and AI-powered pricing for the perfect stay at the perfect time.",
        "hero.cta1": "Explore Experiences",
        "hero.cta2": "Our Story",

        // Story
        "story.label": "Our Resort Story",
        "story.headline1": "We don't just host guests.",
        "story.headline2": "We create unforgettable stays.",
        "story.description": "For more than a decade, VAGUE Resort has welcomed travelers, families, and business guests with warm Ethiopian hospitality and world-class comfort.",
        "story.impact.title": "Hospitality With Purpose",
        "story.impact.badge": "Monthly Program",
        "story.impact.description": "We believe tourism should uplift local communities.",
        "story.trust.title": "Trusted by Travel Partners",
        "story.trust.subtitle": "From destination planners to returning guests.",
        "story.trust.organizations": "Organizations",
        "story.trust.companies": "TripAdvisor, Booking.com, Expedia, Traveloka, Agoda, Hotels.com",
        "story.trust.rooms": "Deluxe Ocean Suite, Royal Infinity Villa, Garden Terrace Room, Panoramic Loft",
        "story.trust.price": "Price:",
        "story.room.deluxe.price": "$250/night",
        "story.room.royal.price": "$550/night",
        "story.room.garden.price": "$180/night",
        "story.room.loft.price": "$320/night",
        "story.stat1.value": "10+",
        "story.stat1.label": "Years of Hospitality",
        "story.stat2.value": "15K+",
        "story.stat2.label": "Happy Guests",
        "story.stat3.value": "120+",
        "story.stat3.label": "Trained Staff",

        // Sections
        "sections.services": "Luxury Services",
        "sections.gallery": "Resort Gallery",
        "sections.contact": "Get in Touch",
        "sections.rooms": "Available Rooms",
        "sections.pricing": "Smart Pricing",
        "sections.analytics": "Guest Intelligence",

        // Services
        "services.title1": "Luxury",
        "services.title2": "Services",
        "services.subtitle": "Indulge in our world-class amenities designed for your absolute comfort and rejuvenation.",

        "services.hospitality.title": "Premium Hospitality",
        "services.hospitality.desc": "Experience the pinnacle of service with our dedicated staff and exclusive guest programs.",

        "services.hospitality.subservices": "Our Offerings",
        "services.hospitality.comfort.title": "Royal Comfort",
        "services.hospitality.comfort.desc": "Plush interiors and personalized room settings for a regal sleep experience.",
        "services.hospitality.dining.title": "Elite Dining",
        "services.hospitality.dining.desc": "Gourmet international and local cuisines prepared by award-winning chefs.",
        "services.hospitality.pool.title": "Infinity Pool",
        "services.hospitality.pool.desc": "Temperature-controlled waters with a seamless view of the horizon.",
        "services.hospitality.garden.title": "Zen Gardens",
        "services.hospitality.garden.desc": "Lush, manicured landscapes perfect for morning walks and meditation.",
        "services.hospitality.spa.title": "Wellness Spa",
        "services.hospitality.spa.desc": "Holistic treatments and traditional therapies for body and soul.",
        "services.hospitality.stay.title": "Luxury Stay",
        "services.hospitality.stay.desc": "All-inclusive packages covering every detail of your vacation.",

        "services.wellness.title": "Wellness & Spa",
        "services.wellness.desc": "Rejuvenate your senses with our expert therapeutic treatments.",
        "services.adventure.title": "Local Adventures",
        "services.adventure.desc": "Curated tours to explore the hidden gems and culture of the region.",
        "services.events.title": "Events & Meetings",
        "services.events.desc": "World-class facilities for your corporate gatherings or private celebrations.",

        // Training
        "training.hero.title1": "Elite",
        "training.hero.title2": "Hospitality",
        "training.hero.subtitle": "Master luxury service with our professional training programs. From front desk excellence to culinary mastery.",
        "training.hero.cta": "Apply Now",
        "training.nav": "Training",
        "training.about.label": "Excellence in Service",
        "training.about.headline": "We nurture the next generation of global hoteliers.",
        "training.about.description": "VAGUE Academy provides industry-leading hospitality education, combining traditional craftsmanship with modern technology to create world-class service professionals.",
        "training.stats.students": "500+",
        "training.stats.students.label": "Graduates",
        "training.stats.success": "95%",
        "training.stats.success.label": "Job Placement",
        "training.stats.projects": "400+",
        "training.stats.projects.label": "Partner Resorts",
        "training.badge.popular": "Fast Track",
        "training.courses.title1": "Professional",
        "training.courses.title2": "Courses",
        "training.courses.subtitle": "Select from our specialized programs designed for career acceleration in the hospitality world.",
        "training.course.pro": "Executive Management",
        "training.course.pro.desc": "Strategic hospitality leadership and operations for modern luxury resorts.",
        "training.course.pro.duration": "6 Months",
        "training.course.pro.level": "Advanced",
        "training.course.basic": "Service Foundations",
        "training.course.basic.desc": "Master the fundamentals of guest relations, housekeeping, and front-desk excellence.",
        "training.course.basic.duration": "3 Months",
        "training.course.basic.level": "Beginner",
        "training.course.intermediate.duration": "4 Months",
        "training.course.intermediate.level": "Intermediate",
        "training.course.intermediate.desc": "Deep dive into fine dining, international cuisines, and high-service standards.",
        "training.course.zero2hero": "Zero2Hero Full Practice",
        "training.course.zero2hero.desc": "A comprehensive 1-year journey from zero to full professional hospitality expert.",
        "training.course.zero2hero.duration": "1 Year",
        "training.course.zero2hero.level": "Zero2Hero",
        "training.enrollment": "Join the Academy",
        "training.enrollment.subtitle": "Start your journey toward a global career in luxury hospitality today. Applications are now open for our next cohort.",
        "training.enrollment.button": "Begin Application",

        // Gallery
        "gallery.title1": "Curated",
        "gallery.title2": "Sanctuaries",
        "gallery.subtitle": "Explore our portfolio of premium ocean-view suites and villas, each designed to harmonize luxury with the natural beauty of the island.",
    },
    am: {
        // Header
        "nav.story": "?????",
        "nav.rooms": "???",
        "nav.accommodations": "??? ?????",
        "nav.services": "???????",
        "nav.gallery": "???",
        "nav.provenance": "ፕሮቬናንስ",
        "nav.training": "????",
        "nav.contact": "????",
        "cta.book": "???? ???",

        // Hero
        "hero.title1": "?? ??? ?",
        "hero.title2": "?? ????",
        "hero.subtitle": "???? ??? ???? ????? ?? ???? ?? ?AI ???? ?? ???? ?????",
        "hero.cta1": "????? ???",
        "hero.cta2": "?????",

        // Story
        "story.label": "??????? ???",
        "story.headline1": "?? ?????? ?? ?????????",
        "story.headline2": "????? ?????? ????????",
        "story.description": "???? ???? ???? ?? ???? ???????? ?????? ?? ???? ?????? ???? ?????? ?????? ?? ???? ??? ??? ??? ???? ?????",
        "story.impact.title": "??? ??? ??????",
        "story.impact.badge": "???? ?????",
        "story.impact.description": "???? ??????? ?????? ???? ???? ??? ???????",
        "story.trust.title": "??? ???? ????????",
        "story.trust.subtitle": "??? ????? ??? ???? ??????",
        "story.trust.organizations": "?????",
        "story.trust.companies": "TripAdvisor, Booking.com, Expedia, Traveloka, Agoda, Hotels.com",
        "story.trust.rooms": "???? ???? ???, ??? ????? ??, ???? ???, ????? ???",
        "story.trust.price": "??:",
        "story.room.deluxe.price": "250 $/???",
        "story.room.royal.price": "550 $/???",
        "story.room.garden.price": "180 $/???",
        "story.room.loft.price": "320 $/???",
        "story.stat1.value": "10+",
        "story.stat1.label": "??????? ????",
        "story.stat2.value": "15?+",
        "story.stat2.label": "???? ?????",
        "story.stat3.value": "120+",
        "story.stat3.label": "????? ?????",

        // Sections
        "sections.services": "?? ???????",
        "sections.gallery": "????? ???",
        "sections.contact": "????",
        "sections.rooms": "??? ????",
        "sections.pricing": "???? ??",
        "sections.analytics": "????? ???",

        // Services
        "services.title1": "??",
        "services.title2": "???????",
        "services.subtitle": "????? ??? ?? ?? ??? ????? ??????? ?????? ????? ??? ?????",

        "services.hospitality.title": "???? ???????",
        "services.hospitality.desc": "????? ???? ?? ????? ??????? ?? ????? ??????? ?? ??????????",

        "services.hospitality.subservices": "?? ???????",
        "services.hospitality.comfort.title": "??? ????",
        "services.hospitality.comfort.desc": "??? ????? ?? ????? ???? ??? ??? ??? ?????",
        "services.hospitality.dining.title": "??? ????",
        "services.hospitality.dining.desc": "???? ??? ????? ?? ????? ???? ????? ????? ???? ?????",
        "services.hospitality.pool.title": "????? ??",
        "services.hospitality.pool.desc": "???? ?? ????? ???? ????? ???? ?????? ?????",
        "services.hospitality.garden.title": "?? ????",
        "services.hospitality.garden.desc": "???? ???? ??? ?? ??? ???? ?? ????? ?????",
        "services.hospitality.spa.title": "?? ???",
        "services.hospitality.spa.desc": "???? ?? ????? ?? ???? ??? ????? ???????",
        "services.hospitality.stay.title": "??? ???",
        "services.hospitality.stay.desc": "?? ???? ????? ?? ????? ??? ??? ?????",

        "services.wellness.title": "?? ?? ???",
        "services.wellness.desc": "????? ???? ?? ????? ?? ??? ??? ??? ??? ?????",
        "services.adventure.title": "???? ?????",
        "services.adventure.desc": "????? ????? ??? ?? ???? ????? ??????? ?????",
        "services.events.title": "???? ?? ???",
        "services.events.desc": "?? ??? ?????? ?? ????? ??? ?????? ????? ?????",

        // Training
        "training.hero.title": "??????? ???",
        "training.hero.subtitle": "???? ????? ???????? ????? ??????? ???? ??? ??? ???? ??? ??? ???? ???? ????",
        "training.hero.cta": "???? ?????",
        "training.stats.students": "500+",
        "training.stats.students.label": "?????",
        "training.stats.success": "95%",
        "training.stats.success.label": "??? ???",
        "training.stats.projects": "400+",
        "training.stats.projects.label": "??? ?????",
        "training.badge.popular": "??? ????",
        "training.course.intermediate.duration": "4 ???",
        "training.course.intermediate.level": "?????",
        "training.course.intermediate.desc": "???? ???? ?????? ??? ??? ???? ?? ???? ??????? ????? ?? ??? ?????",
        "training.course.zero2hero": "Zero2Hero ?? ????",
        "training.course.zero2hero.desc": "??? ??? ?? ???? ?????? ?1 ??? ????? ?????",
        "training.course.zero2hero.duration": "1 ???",
        "training.course.zero2hero.level": "Zero2Hero",

        // Gallery
        "gallery.title1": "????",
        "gallery.title2": "????",
        "gallery.subtitle": "???? ?? ?? ?? ??? ????? ?? ????? ??? ??? ????? ????? ????? ?? ??? ??? ?????",
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    const toggleLanguage = useCallback(() => {
        setLanguage((prev) => (prev === "en" ? "am" : "en"));
    }, []);

    const t = useCallback((key: string): string => {
        return translations[language][key] || translations["en"][key] || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
