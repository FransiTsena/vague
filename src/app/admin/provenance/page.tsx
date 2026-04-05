"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { ArrowLeft, Copy, Download, Edit2, ExternalLink, Plus, QrCode, Save, Sparkles, Trash2, X, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { defaultProvenanceDraft, slugify, type ProvenanceProductDraft } from "@/lib/provenance-admin";

type ProvenanceProductRecord = ProvenanceProductDraft & {
  scanUrl: string;
  qrDataUrl: string;
  createdAt: string;
};

type QrSettings = {
  size: number;
  margin: number;
};

const STORAGE_KEY = "provenance-admin-items-v1";

export default function ProvenanceAdminPage() {
  const { isDark } = useTheme();
  const [origin] = useState(() => (typeof window !== "undefined" ? window.location.origin : ""));
  const [draft, setDraft] = useState<ProvenanceProductDraft>(defaultProvenanceDraft);
  const [items, setItems] = useState<ProvenanceProductRecord[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored) as ProvenanceProductRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });
  const [settings, setSettings] = useState<QrSettings>({ size: 320, margin: 2 });
  const [qrPreview, setQrPreview] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Editing state
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProvenanceProductRecord | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const activeScanUrl = useMemo(() => {
    const base = origin || "http://localhost:3000";
    const slug = draft.slug || slugify(draft.title || defaultProvenanceDraft.title);
    return `${base}/provenance/${slug}`;
  }, [draft.slug, draft.title, origin]);

  useEffect(() => {
    let cancelled = false;

    const renderQr = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(activeScanUrl, {
          errorCorrectionLevel: "M",
          margin: settings.margin,
          width: settings.size,
          color: {
            dark: "#050505",
            light: "#ffffff",
          },
        });

        if (!cancelled) {
          setQrPreview(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setQrPreview("");
        }
      }
    };

    void renderQr();

    return () => {
      cancelled = true;
    };
  }, [activeScanUrl, settings.margin, settings.size]);

  const updateDraft = (field: keyof ProvenanceProductDraft, value: string) => {
    if (field === "title") {
      setDraft((current) => ({ ...current, title: value, slug: slugify(value) }));
      return;
    }
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const generateWithAI = async () => {
    if (!aiDescription.trim()) {
      setAiError("Add a short product description first.");
      return;
    }

    setAiError(null);
    setError(null);
    setMessage(null);
    setGeneratingAi(true);

    try {
      const response = await fetch("/api/provenance/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: aiDescription, draft }),
      });

      const payload = (await response.json()) as {
        generatedDraft?: Partial<ProvenanceProductDraft>;
        error?: string;
      };

      if (!response.ok || !payload.generatedDraft) {
        throw new Error(payload.error ?? "Failed to generate with AI.");
      }

      setDraft((current) => {
        const merged: ProvenanceProductDraft = {
          ...current,
          ...payload.generatedDraft,
        };

        const finalSlug = slugify(merged.title);

        return {
          ...merged,
          slug: finalSlug,
        };
      });

      // Show the manual form so the user can see the fetched image URL
      setShowManualForm(true);

      // Now fetch a dynamic image based on the generated story
      try {
        const imageRes = await fetch("/api/provenance/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payload.generatedDraft.title,
            story: payload.generatedDraft.story,
            itemType: payload.generatedDraft.itemType,
          }),
        });
        if (imageRes.ok) {
          const imageData = await imageRes.json();
          if (imageData.url) {
            setDraft((prev) => ({ ...prev, imageUrl: imageData.url }));
          }
        }
      } catch (imgErr) {
        console.error("AI Image fetch failed:", imgErr);
      }

      setMessage("AI generated a full story and selected a matching visual.");
    } catch (generationError) {
      setAiError(generationError instanceof Error ? generationError.message : "Failed to generate with AI.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const slug = draft.slug.trim() || slugify(draft.title);
    if (!slug) {
      setError("Please provide a valid title or slug.");
      return;
    }

    const exists = items.some((item) => item.slug === slug);
    if (exists) {
      setError(`Slug "${slug}" already exists. Use a unique slug.`);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/provenance/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const payload = await response.json() as { success: boolean; error?: string; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Failed to save product to database.");
      }

      const scanUrl = `${origin || "http://localhost:3000"}/provenance/${slug}`;

      setItems((current) => [
        {
          ...draft,
          slug,
          scanUrl,
          qrDataUrl: qrPreview,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);

      setMessage(`QR created for ${slug} and saved to database.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (item: ProvenanceProductRecord) => {
    setEditingSlug(item.slug);
    setEditDraft({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingSlug(null);
    setEditDraft(null);
  };

  const updateEditDraft = (field: keyof ProvenanceProductDraft, value: string) => {
    if (!editDraft) return;
    
    const newDraft = { ...editDraft, [field]: value };
    
    if (field === "title") {
      newDraft.slug = slugify(value);
    }
    
    // Update the scan URL if slug changes
    const base = origin || "http://localhost:3000";
    newDraft.scanUrl = `${base}/provenance/${newDraft.slug}`;
    
    setEditDraft(newDraft);
  };

  const handleSaveEdit = async () => {
    if (!editDraft || !editingSlug) return;

    setSaving(true);
    setError(null);

    try {
      // Regenerate QR code if the scan URL changed
      const qrDataUrl = await QRCode.toDataURL(editDraft.scanUrl, {
        errorCorrectionLevel: "M",
        margin: settings.margin,
        width: settings.size,
        color: {
          dark: "#050505",
          light: "#ffffff",
        },
      });

      const updatedItem: ProvenanceProductRecord = {
        ...editDraft,
        qrDataUrl,
      };

      // Sync with DB
      const response = await fetch("/api/provenance/products", {
        method: "POST", // POST handles upsert in this API
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) throw new Error("Failed to sync updates to database");

      setItems((current) =>
        current.map((item) => (item.slug === editingSlug ? updatedItem : item))
      );

      setEditingSlug(null);
      setEditDraft(null);
      setMessage("Product updated and synced with database.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (scanUrl: string, slug: string) => {
    await navigator.clipboard.writeText(scanUrl);
    setCopiedSlug(slug);
    window.setTimeout(() => setCopiedSlug(null), 1400);
  };

  const handleDownload = (dataUrl: string, slug: string) => {
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${slug}-qr.png`;
    anchor.click();
  };

  const handleDelete = async (slug: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/provenance/products?slug=${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete from database.");
      }

      setItems((current) => current.filter((item) => item.slug !== slug));
      setMessage(`Deleted ${slug} from dashboard and database.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to delete product.");
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    setItems([]);
    setMessage("Cleared all saved products.");
  };

  return (
    <main className={`relative min-h-screen overflow-hidden`}>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8 md:px-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/admin" className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] transition ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-black"}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/provenance" className={`inline-flex items-center justify-center p-2 rounded-full border transition ${isDark ? "border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white" : "border-black/10 text-neutral-600 hover:bg-black/5 hover:text-black"}`} title="Learn about Provenance">
              <Info className="h-4 w-4" />
            </Link>
            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.35em] ${isDark ? "border-white/10 bg-white/5 text-neutral-300" : "border-black/10 bg-neutral-50 text-neutral-600"}`}>
              <QrCode className="h-4 w-4" />
              Scanner Experience
            </span>
          </div>
        </div>

        <div className={`mb-10 flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-end ${isDark ? "border-white/10" : "border-black/10"}`}>
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl font-light tracking-wide md:text-4xl text-neutral-900 dark:text-white">Provenance Studio</h1>
            <p className={`mt-4 text-sm leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Manage the <span className="italic text-amber-600 dark:text-amber-400">Digital Soul</span> of handcrafted amenities. Provenance is designed to empower local communities and promote sustainable tourism by connecting guests directly with regional artisans. Every scan invites guests to trace an item's authentic origin, meet the creator, <span className="italic">Tip the Artisan</span>, or <span className="italic">Order to Home</span>-transforming hotel stays into a driver for local economic growth.
            </p>
          </div>
          <div className={`grid grid-cols-2 lg:flex shrink-0 flex-wrap gap-4 text-[9px] uppercase tracking-[0.2em] font-medium ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
            <span className={`rounded-full border px-3 py-1.5 ${isDark ? "border-white/10 bg-white/5 text-neutral-400" : "border-black/10 bg-black/5 text-neutral-600"}`}>🌍 Sustainable Tourism</span>
            <span className={`rounded-full border px-3 py-1.5 ${isDark ? "border-white/10 bg-white/5 text-neutral-400" : "border-black/10 bg-black/5 text-neutral-600"}`}>🤝 Local Empowerment</span>
            <span className={`rounded-full border px-3 py-1.5 ${isDark ? "border-white/10 bg-white/5 text-neutral-400" : "border-black/10 bg-black/5 text-neutral-600"}`}>✨ AI Storytelling</span>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative">
            <h2 className="font-serif text-xl font-light tracking-wide text-neutral-900 dark:text-white">1. Define Story</h2>

            <div className="mt-6">
              <p className={`text-xs uppercase tracking-[0.28em] mb-3 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>Describe the item</p>
              <textarea
                value={aiDescription}
                onChange={(event) => setAiDescription(event.target.value)}
                placeholder="Describe the product, artisan, origin, materials, and the feeling you want guests to have."
                className={`mt-3 min-h-24 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
              />
              <div className="mt-3">
                <Button variant="secondary" className="inline-flex gap-2 text-xs" type="button" onClick={generateWithAI} disabled={generatingAi}>
                  <Sparkles className="h-4 w-4" />
                  {generatingAi ? "Generating with AI..." : "Generate with AI"}
                </Button>
              </div>
            </div>

            <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
              {!showManualForm ? (
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(true)}
                    className={`flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition ${isDark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    <Plus className="h-3 w-3" />
                    Fill manual fields instead
                  </button>
                </div>
              ) : (
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className={`flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition ${isDark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Focus on AI generation
                  </button>
                </div>
              )}

              {(showManualForm || draft.title !== defaultProvenanceDraft.title) && (
                <>
                  <label className="space-y-2 md:col-span-1">
                    <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Slug</span>
                    <input
                      value={draft.slug}
                      onChange={(event) => updateDraft("slug", slugify(event.target.value))}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                      placeholder="sidamo-coffee"
                      required
                    />
                  </label>
                  <label className="space-y-2 md:col-span-1">
                    <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Item type</span>
                    <input
                      value={draft.itemType}
                      onChange={(event) => updateDraft("itemType", event.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                      placeholder="Coffee"
                      required
                    />
                  </label>

              <label className="space-y-2 md:col-span-1">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Title</span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  placeholder="Sidamo Reserve Coffee"
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-1">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Creator name</span>
                <input
                  value={draft.creatorName}
                  onChange={(event) => updateDraft("creatorName", event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Creator role</span>
                <input
                  value={draft.creatorRole}
                  onChange={(event) => updateDraft("creatorRole", event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Creator location</span>
                <input
                  value={draft.creatorLocation}
                  onChange={(event) => updateDraft("creatorLocation", event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Origin</span>
                <input
                  value={draft.origin}
                  onChange={(event) => updateDraft("origin", event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Materials</span>
                <input
                  value={draft.materials}
                  onChange={(event) => updateDraft("materials", event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  placeholder="Highland arabica, spring water processing"
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Story</span>
                <textarea
                  value={draft.story}
                  onChange={(event) => updateDraft("story", event.target.value)}
                  className={`min-h-32 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Image URL</span>
                <input
                  name="imageUrl"
                  value={draft.imageUrl}
                  onChange={(event) => updateDraft("imageUrl", event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Image direction</span>
                <textarea
                  value={draft.imageDirection}
                  onChange={(event) => updateDraft("imageDirection", event.target.value)}
                  className={`min-h-24 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                  placeholder="Guidance for selecting/editing the product image"
                  required
                />
              </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">Tip text</span>
                    <input
                      value={draft.tipText}
                      onChange={(event) => updateDraft("tipText", event.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? "border-white/10 bg-black/40 text-white focus:border-white/30" : "border-black/10 bg-white text-black focus:border-black/30"}`}
                      required
                    />
                  </label>
                </>
              )}

              <div className="md:col-span-2">
                <Button variant="primary" className="inline-flex gap-2 text-xs" type="submit" disabled={saving}>
                  <Plus className="h-4 w-4" />
                  {saving ? "Saving to database..." : "Generate QR product"}
                </Button>
              </div>
            </form>

            {error && <p className={`mt-4 text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>{error}</p>}
            {aiError && <p className={`mt-2 text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>{aiError}</p>}
            {message && <p className={`mt-5 text-sm ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>{message}</p>}
          </section>

          <aside className={`relative overflow-hidden rounded-[2.2rem] border p-6 md:p-7 ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white/80"}`}>
          
            <div className="relative">
              <p className={`text-xs uppercase tracking-[0.35em] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>Chapter two</p>
              <h3 className="mt-2 font-serif text-2xl leading-tight md:text-3xl">Live QR preview</h3>
              <div className={`mt-5 overflow-hidden rounded-3xl border p-4 ${isDark ? "border-white/10 bg-white" : "border-black/10 bg-white"}`}>
                {qrPreview ? (
                  <Image src={qrPreview} alt="QR code preview" width={settings.size} height={settings.size} className="h-auto w-full" unoptimized />
                ) : (
                  <div className={`flex min-h-80 items-center justify-center text-sm ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>Generating QR...</div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(activeScanUrl, draft.slug)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${isDark ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-neutral-800 hover:bg-neutral-100"}`}
                >
                  <Copy className="h-4 w-4" />
                  Copy route
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(qrPreview, draft.slug || "preview")}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${isDark ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-neutral-800 hover:bg-neutral-100"}`}
                >
                  <Download className="h-4 w-4" />
                  Download QR
                </button>
              </div>
              <p className={`mt-4 text-sm leading-6 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Guests scan this code to open the exact product page for the item, not a generic landing page.
              </p>
            </div>

            <div className={`mt-8 border-t pt-8 ${isDark ? "border-white/10" : "border-black/10"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className={`text-xs uppercase tracking-[0.35em] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>Saved products ({items.length})</p>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.25em] transition ${isDark ? "border-red-400/30 text-red-300 hover:bg-red-500/15" : "border-red-300 text-red-600 hover:bg-red-100"}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="mt-4 space-y-4">
                {items.length === 0 ? (
                  <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>No products have been generated yet.</p>
                ) : (
                  items.map((item) => (
                    <article
                      key={item.slug}
                      className={`rounded-2xl border p-4 shadow-sm transition-all duration-300 ${isDark ? "border-white/10 bg-black/25" : "border-black/10 bg-white"} ${editingSlug === item.slug ? "scale-[1.02] border-amber-500/40 ring-1 ring-amber-500/20 shadow-xl" : ""}`}
                    >
                      {editingSlug === item.slug && editDraft ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500">Edit Mode</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <InputField label="Title" value={editDraft.title} onChange={(v) => updateEditDraft("title", v)} isDark={isDark} />
                            <InputField label="Type" value={editDraft.itemType} onChange={(v) => updateEditDraft("itemType", v)} isDark={isDark} />
                            <InputField label="Creator" value={editDraft.creatorName} onChange={(v) => updateEditDraft("creatorName", v)} isDark={isDark} />
                            <InputField label="Role" value={editDraft.creatorRole} onChange={(v) => updateEditDraft("creatorRole", v)} isDark={isDark} />
                          </div>
                          <InputField label="Story Fragment" value={editDraft.story} onChange={(v) => updateEditDraft("story", v)} isDark={isDark} isTextArea />

                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={handleSaveEdit}
                              className="inline-flex items-center gap-2 rounded-full bg-amber-500 text-black px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-colors"
                            >
                              <Save className="h-3 w-3" />
                              Update Record
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`text-[10px] uppercase tracking-[0.3em] ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>{item.itemType}</p>
                              <h2 className={`mt-1 text-lg ${isDark ? "text-white" : "text-neutral-900"}`}>{item.title}</h2>
                              <p className={`mt-1 text-sm ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>{item.creatorName}</p>
                            </div>
                            <div className={`rounded-2xl overflow-hidden border p-2 ${isDark ? "border-white/10 bg-white" : "border-black/10 bg-white"}`}>
                              <Image src={item.qrDataUrl} alt={`${item.title} QR`} width={88} height={88} className="h-20 w-20" unoptimized />
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(item.scanUrl, item.slug)}
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${isDark ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-neutral-800 hover:bg-neutral-100"}`}
                            >
                              <Copy className="h-4 w-4" />
                              {copiedSlug === item.slug ? "Copied" : "Copy link"}
                            </button>
                            <Link
                              href={item.scanUrl}
                              target="_blank"
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${isDark ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-neutral-800 hover:bg-neutral-100"}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open page
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${isDark ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-neutral-800 hover:bg-neutral-100"}`}
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(item.qrDataUrl, item.slug)}
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${isDark ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-neutral-800 hover:bg-neutral-100"}`}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.slug)}
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${isDark ? "border-red-400/30 text-red-300 hover:bg-red-500/15" : "border-red-300 text-red-600 hover:bg-red-100"}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                          <div className={`mt-4 text-xs ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                            Route: <span className={isDark ? "text-white" : "text-neutral-900"}>/provenance/{item.slug}</span>
                          </div>
                          <div className={`mt-1 text-xs ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
                            Created: {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </>
                      )}
                    </article>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className={`mt-10 border-l pl-6 text-sm leading-7 italic ${isDark ? "border-white/15 text-neutral-300" : "border-black/15 text-neutral-700"}`}>
          This first pass keeps the registry local to the dashboard. The next step is to persist products in the database and generate QR codes from saved records.
        </div>
      </section>
    </main>
  );
}

const InputField = ({ label, value, onChange, isDark, isTextArea = false }: { 
  label: string, 
  value: string, 
  onChange: (v: string) => void, 
  isDark: boolean,
  isTextArea?: boolean
}) => (
  <label className="block space-y-1">
    <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">{label}</span>
    {isTextArea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition min-h-[80px] ${isDark ? "border-white/10 bg-black/40 focus:border-amber-500/30 text-white" : "border-black/10 bg-white focus:border-amber-500/30 text-black"}`}
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition ${isDark ? "border-white/10 bg-black/40 focus:border-amber-500/30 text-white" : "border-black/10 bg-white focus:border-amber-500/30 text-black"}`}
      />
    )}
  </label>
);
