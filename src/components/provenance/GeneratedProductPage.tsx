"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BadgeCheck, HeartHandshake, MapPin } from "lucide-react";

type StoredGeneratedProduct = {
    slug: string;
    itemType: string;
    title: string;
    creatorName: string;
    creatorRole: string;
    creatorLocation: string;
    origin: string;
    materials: string;
    story: string;
    imageUrl: string;
    tipText: string;
};

const STORAGE_KEY = "provenance-admin-items-v1";

export default function GeneratedProductPage({ slug }: { slug: string }) {
    const product = useMemo(() => {
        if (typeof window === "undefined") {
            return null;
        }

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as StoredGeneratedProduct[];
            if (!Array.isArray(parsed)) return null;
            return parsed.find((item) => item.slug === slug) ?? null;
        } catch {
            return null;
        }
    }, [slug]);

    const materialList = useMemo(() => {
        if (!product) return [];
        return product.materials
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);
    }, [product]);

    if (!product) {
        return (
            <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.12),_transparent_30%),linear-gradient(180deg,_#f8f5ef_0%,_#ffffff_100%)] px-6 pb-20 pt-28 text-black dark:bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.22),_transparent_30%),linear-gradient(180deg,_#040404_0%,_#090909_100%)] dark:text-white md:px-12">
                <div className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">Product not found</p>
                    <h1 className="mt-3 font-serif text-4xl">This QR slug is not available on this device.</h1>
                    <p className="mt-4 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
                        The item may have been generated in the admin dashboard on another browser session. Create it again from admin or connect persistent storage to make it globally available.
                    </p>
                    <Link href="/admin/provenance" className="mt-6 inline-flex items-center rounded-full border border-black/15 px-5 py-3 text-xs uppercase tracking-[0.25em] dark:border-white/15">
                        Open admin provenance
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.12),_transparent_30%),linear-gradient(180deg,_#f8f5ef_0%,_#ffffff_100%)] text-black dark:bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.22),_transparent_30%),linear-gradient(180deg,_#040404_0%,_#090909_100%)] dark:text-white">
            <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8 md:px-12">
                <Link href="/provenance" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-neutral-600 transition hover:text-black dark:text-neutral-400 dark:hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    Back to index
                </Link>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.45em] text-neutral-500 dark:text-neutral-400">{product.itemType}</p>
                            {/* VULNERABILITY: Stored XSS in the Title field for educational purposes */}
                            <h1 
                                className="mt-3 font-serif text-4xl leading-tight md:text-6xl"
                                dangerouslySetInnerHTML={{ __html: product.title }}
                            />
                            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <BadgeCheck className="h-4 w-4" />
                                    {product.creatorName}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <MapPin className="h-4 w-4" />
                                    {product.creatorLocation}
                                </span>
                            </div>
                        </div>

                        <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-white/5">
                            <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-sm leading-7 text-white">{product.origin}</p>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">Story</p>
                            <p className="mt-3 text-sm leading-8 text-neutral-700 dark:text-neutral-300">{product.story}</p>
                        </div>
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">Materials</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {materialList.map((material) => (
                                    <span key={material} className="rounded-full border border-black/10 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 dark:border-white/10 dark:bg-black/30 dark:text-neutral-200">
                                        {material}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
                                <HeartHandshake className="h-4 w-4" />
                                Tip message
                            </div>
                            <p className="mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-300">{product.tipText}</p>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
