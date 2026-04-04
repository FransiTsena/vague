"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, MessageCircle, X } from "lucide-react";

type GalleryImage = {
    id: string;
    imageUrl: string;
};

type GalleryProject = {
    id: string;
    titleEn: string;
    titleAm: string;
    thumbnailUrl: string;
    images: GalleryImage[];
};

export default function Gallery() {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();
    const [projects, setProjects] = useState<GalleryProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedDesign, setSelectedDesign] = useState<GalleryProject | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const openDesign = (design: GalleryProject) => {
        setSelectedDesign(design);
        setActiveImageIndex(0);
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadProjects = async () => {
            try {
                setLoadingProjects(true);
                setLoadError(null);

                const response = await fetch("/api/gallery/projects", {
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Failed to load gallery projects.");
                }

                const payload = await response.json();
                setProjects(payload.projects ?? []);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return;
                }

                setLoadError("Unable to load gallery projects.");
            } finally {
                setLoadingProjects(false);
            }
        };

        void loadProjects();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!selectedDesign) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedDesign(null);
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [selectedDesign]);

    const handleInquiryClick = () => {
        window.location.href = "/booking";
    };

    const displayedProjects = projects;

    if (loadingProjects || loadError || displayedProjects.length === 0) return null;

    const getDesignImages = (design: GalleryProject) => {
        const images = design.images.map((image) => image.imageUrl).filter(Boolean);
        return images.length > 0 ? images : [design.thumbnailUrl];
    };

    const handlePrevImage = () => {
        if (!selectedDesign) return;
        const images = getDesignImages(selectedDesign);
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNextImage = () => {
        if (!selectedDesign) return;
        const images = getDesignImages(selectedDesign);
        setActiveImageIndex((prev) => (prev + 1) % images.length);
    };

    const getDesignDescription = (designName: string) =>
        `"${designName}" is a signature resort experience designed for comfort, relaxation, and memorable stays.`;

    return (
        <Section id="gallery" className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
            <div className="max-w-7xl mx-auto" lang={language}>
                <div className="text-center mb-20 md:mb-24">
                    <h2 className={`text-5xl md:text-7xl font-serif font-light tracking-tight mb-8 ${isDark ? "text-white/90" : "text-black/90"}`}>
                        {t("gallery.title1")} <br />
                        <span className={`italic ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{t("gallery.title2")}</span>
                    </h2>
                    <p className={`text-xl font-light tracking-wide max-w-2xl mx-auto ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>{t("gallery.subtitle")}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {displayedProjects.map((design, idx) => (
                        <motion.div
                            key={design.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={`group relative aspect-[3/4] overflow-hidden cursor-pointer transition-all duration-700 ${isDark ? "bg-neutral-900" : "bg-neutral-50"}`}
                            role="button"
                            tabIndex= { 0}
                            aria-label={`View ${design.titleEn} design`}
                            onClick={() => openDesign(design)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    openDesign(design);
                                }
                            }}
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                style={{ backgroundImage: `url(${design.thumbnailUrl})` }}
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-black via-black/20 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                {/* Category Badge */}
                                <div className="flex justify-end overflow-hidden">
                                    <span className={`text-[10px] font-light uppercase tracking-[0.3em] px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/10 text-white transform translate-y-[-120%] group-hover:translate-y-0 transition-transform duration-500`}>
                                        {language === "am" ? "ሪዞርት" : "resort"}
                                    </span>
                                </div>

                                {/* Title & CTA */}
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-serif font-light text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                        {language === "am" ? design.titleAm : design.titleEn}
                                    </h3>
                                    <div className="flex items-center gap-3 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100">
                                        <Eye className="w-4 h-4 text-white/60" />
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-medium">{t("gallery.viewProject")}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedDesign && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            aria-modal="true"
                            role="dialog"
                            onClick={() => setSelectedDesign(null)}
                            onWheel={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}
                        >
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                            <motion.div
                                className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto overscroll-contain ${isDark ? "bg-neutral-950 border-white/10" : "bg-white border-black/10"}`}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.98, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                onClick={(event) => event.stopPropagation()}
                                onWheel={(event) => {
                                    event.stopPropagation();
                                }}
                            >
                                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-black/10"}`}>
                                    <div>
                                        <p className={`text-xs uppercase tracking-[0.3em] ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                            {language === "am" ? "የሪዞርት ቅድሚያ" : "Resort Preview"}
                                        </p>
                                        <h3 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-black"}`}>
                                            {language === "am" ? selectedDesign.titleAm : selectedDesign.titleEn}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDesign(null)}
                                        className={`p-2 rounded-full transition ${isDark ? "text-neutral-400 hover:text-white hover:bg-white/10" : "text-neutral-500 hover:text-black hover:bg-black/5"}`}
                                        aria-label={language === "am" ? "መዝጊያ" : "Close"}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 p-6">
                                    <div className="space-y-4">
                                        <div className="relative overflow-hidden rounded-xl border border-black/10 bg-black/5 w-[600px] h-[380px] max-w-full">
                                            <Image
                                                src={getDesignImages(selectedDesign)[activeImageIndex]}
                                                alt={language === "am" ? selectedDesign.titleAm : selectedDesign.titleEn}
                                                fill
                                                sizes="(max-width: 1024px) 100vw, 600px"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={handlePrevImage}
                                                className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur ${isDark
                                                    ? "bg-black/50 text-white hover:bg-black/70"
                                                    : "bg-white/70 text-black hover:bg-white"
                                                    }`}
                                                aria-label={language === "am" ? "ቀደም ያለ ምስል" : "Previous image"}
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur ${isDark
                                                    ? "bg-black/50 text-white hover:bg-black/70"
                                                    : "bg-white/70 text-black hover:bg-white"
                                                    }`}
                                                aria-label={language === "am" ? "ቀጣይ ምስል" : "Next image"}
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex gap-3 overflow-x-auto flex-nowrap pb-2 w-[600px] max-w-full">
                                            {getDesignImages(selectedDesign).map((image, index) => (
                                                <div
                                                    key={`${selectedDesign.id}-${image}`}
                                                    className={`relative overflow-hidden rounded-lg border shrink-0 w-28 h-16 ${activeImageIndex === index
                                                        ? isDark
                                                            ? "border-white/50"
                                                            : "border-black/60"
                                                        : isDark
                                                            ? "border-white/10"
                                                            : "border-black/10"
                                                        }`}
                                                    aria-label={language === "am" ? `ተጨማሪ ምስል ${index + 1}` : `Additional image ${index + 1}`}
                                                >
                                                    <Image
                                                        src={image}
                                                        alt=""
                                                        fill
                                                        sizes="112px"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className={`text-sm uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                                {language === "am" ? "ምድብ" : "Category"}
                                            </p>
                                            <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}>
                                                {language === "am" ? "ሪዞርት" : "resort"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                                {language === "am" ? "ማብራሪያ" : "Overview"}
                                            </p>
                                            <p className={`${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                                                {getDesignDescription(language === "am" ? selectedDesign.titleAm : selectedDesign.titleEn)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                                {language === "am" ? "ተጨማሪ ምስሎች" : "More Photos"}
                                            </p>
                                            <p className={`${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                                                {language === "am"
                                                    ? "ተጨማሪ ምስሎችን ለማየት በግራ/ቀኝ ቀስት ምስሎችን ይጫኑ። ትንሽ ምስሎች በአንድ መስመር ይታያሉ።"
                                                    : "Use the left/right arrows to scroll photos. Thumbnails stay on one line and can scroll horizontally."}
                                            </p>
                                        </div>
                                        <Button
                                            variant="primary"
                                            className={`gap-2 ${language === "en" ? "text-xs" : "text-sm"}`}
                                            onClick={handleInquiryClick}
                                        >
                                            <MessageCircle className={language === "en" ? "w-4 h-4" : "w-[18px] h-[18px]"} />
                                            {language === "am" ? "አሁን ቦታ ይያዙ" : "Book Your Stay Now"}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats or Call to Action */}
                <div className="mt-16 text-center">
                    <p className={`text-sm ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                        {language === "en"
                            ? "A glimpse of our signature spaces and experiences. Contact us for availability and special offers."
                            : "የሪዞርታችን ምርጥ ቦታዎች እና ልምዶች ማሳያ። የቦታ እና ልዩ ቅናሾች መረጃ ለማግኘት ያግኙን።"}
                    </p>
                </div>
            </div>
        </Section>
    );
}