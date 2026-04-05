"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

export default function PlatformFeatures() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLIFrameElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { t, language } = useLanguage();
    const { isDark } = useTheme();

    useEffect(() => {
        // Load YouTube API script
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        let player: any;

        const onPlayerReady = (event: any) => {
            // Player is ready, we can now use ScrollTrigger to control it
            ScrollTrigger.create({
                trigger: ".video-container",
                start: "top 60%",
                onEnter: () => {
                    event.target.playVideo();
                    event.target.unMute();
                    setIsPlaying(true);
                },
                onEnterBack: () => {
                    event.target.playVideo();
                    setIsPlaying(true);
                },
                onLeave: () => {
                    event.target.pauseVideo();
                    setIsPlaying(false);
                },
                onLeaveBack: () => {
                    event.target.pauseVideo();
                    setIsPlaying(false);
                },
            });
        };

        (window as any).onYouTubeIframeAPIReady = () => {
            player = new (window as any).YT.Player('youtube-player', {
                events: {
                    'onReady': onPlayerReady
                }
            });
        };

        const ctx = gsap.context(() => {
            gsap.from(".feature-card", {
                y: 60,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                },
            });
        }, containerRef);

        return () => {
            ctx.revert();
            if (player && player.destroy) player.destroy();
        };
    }, []);

    const features = [
        {
            id: "pricing",
            title: t("platform.features.pricing.title"),
            description: t("platform.features.pricing.desc"),
            icon: (
                <svg className="w-12 h-12 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
        },
        {
            id: "scheduling",
            title: t("platform.features.scheduling.title"),
            description: t("platform.features.scheduling.desc"),
            icon: (
                <svg className="w-12 h-12 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            id: "provenance",
            title: t("platform.features.provenance.title"),
            description: t("platform.features.provenance.desc"),
            icon: (
                <svg className="w-12 h-12 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
        },
        {
            id: "analytics",
            title: t("platform.features.analytics.title"),
            description: t("platform.features.analytics.desc"),
            icon: (
                <svg className="w-12 h-12 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
    ];

    return (
        <section
            id="features"
            ref={containerRef}
            className={`pt-40 px-6 overflow-hidden relative ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
            lang={language}
        >
            {/* Background Narrative Text */}
            <div className="absolute top-20 right-10 opacity-[0.02] select-none pointer-events-none">
                <span className="text-[12vw] font-serif italic whitespace-nowrap leading-none">Infrastructure & Logic</span>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-40 space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-[1px] bg-neutral-800" />
                        <span className={`text-[10px] md:text-xs uppercase tracking-[0.8em] font-medium ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                            Institutional Grade
                        </span>
                    </div>
                    <h2 className="text-6xl md:text-9xl font-serif font-light leading-[0.85] tracking-tight">
                        Platform
                        <span className="italic font-extralight text-neutral-600"> Architecture</span>
                    </h2>
                </div>

                {/* Main Video Section */}
                <div className="mb-40 video-container relative aspect-video w-full overflow-hidden border border-white/5 rounded-sm bg-neutral-900/50">
                    <iframe
                        ref={videoRef}
                        id="youtube-player"
                        className="absolute inset-0 w-full h-full"
                        src="https://www.youtube.com/embed/xS9BBulwAm0?enablejsapi=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1"
                        title="Vague Resort | A next-generation hospitality platform"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                    
                    {/* Overlay to catch clicks if needed or for styling */}
                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isPlaying ? "opacity-0" : "opacity-40 bg-black"}`} />
                </div>

            </div>
        </section>
    );
}
