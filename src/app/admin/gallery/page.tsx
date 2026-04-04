"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";

type GalleryImage = {
    id: string;
    imageUrl: string;
};

type GalleryProject = {
    id: string;
    titleEn: string;
    titleAm: string;
    thumbnailUrl: string;
    createdAt: string;
    images: GalleryImage[];
};

export default function GalleryAdminPage() {
    const { isDark } = useTheme();
    const [adminEmail] = useState("admin@vague.com");
    const [projects, setProjects] = useState<GalleryProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const [titleEn, setTitleEn] = useState("");
    const [titleAm, setTitleAm] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [imageUrls, setImageUrls] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingTitleEn, setEditingTitleEn] = useState("");
    const [editingTitleAm, setEditingTitleAm] = useState("");

    const loadProjects = useCallback(async () => {
        setLoadingProjects(true);
        try {
            const response = await fetch("/api/admin/gallery/projects", { cache: "no-store" });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error ?? "Failed to load projects.");
            setProjects(payload.projects ?? []);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to load projects.");
        } finally {
            setLoadingProjects(false);
        }
    }, []);

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    const createProject = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const additionalImages = imageUrls.split(",").map(url => url.trim()).filter(url => url !== "");
            const response = await fetch("/api/admin/gallery/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    titleEn: titleEn.trim(),
                    titleAm: titleAm.trim(),
                    thumbnailUrl: thumbnailUrl.trim(),
                    images: additionalImages,
                }),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error ?? "Failed to create project.");
            setTitleEn(""); setTitleAm(""); setThumbnailUrl(""); setImageUrls("");
            setMessage("Project created successfully.");
            await loadProjects();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to create project.");
        } finally {
            setSaving(false);
        }
    };

    const beginEdit = (project: GalleryProject) => {
        setEditingProjectId(project.id);
        setEditingTitleEn(project.titleEn);
        setEditingTitleAm(project.titleAm);
    };

    const saveEdit = async () => {
        if (!editingProjectId) return;
        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch(`/api/admin/gallery/projects/${editingProjectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titleEn: editingTitleEn, titleAm: editingTitleAm }),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error ?? "Failed to update project.");
            setEditingProjectId(null);
            setMessage("Project updated.");
            await loadProjects();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to update project.");
        } finally {
            setSaving(false);
        }
    };

    const deleteProject = async (projectId: string) => {
        if (!window.confirm("Delete this project?")) return;
        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch(`/api/admin/gallery/projects/${projectId}`, { method: "DELETE" });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error ?? "Failed to delete project.");
            setMessage("Project deleted.");
            await loadProjects();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to delete project.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className={`min-h-screen pt-28 pb-16 px-4 ${isDark ? "bg-neutral-950 text-white" : "bg-white text-black"}`}>
            <div className="mx-auto max-w-7xl space-y-8">
                <section className={`relative overflow-hidden rounded-3xl border p-6 md:p-10 ${isDark ? "border-white/10 bg-neutral-950" : "border-black/10 bg-neutral-50"}`}>
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Vague Control Room</p>
                            <h1 className="mt-2 text-4xl md:text-6xl font-bold tracking-tighter">Gallery Admin</h1>
                        </div>
                        <div className="md:text-right">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Signed In</p>
                            <p className="text-sm">{adminEmail}</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-6">
                    <section className={`rounded-3xl border p-6 md:p-8 ${isDark ? "border-white/10 bg-neutral-900" : "border-black/10 bg-white"}`}>
                        <h2 className="text-2xl font-semibold tracking-tight">Create Project</h2>
                        <form className="mt-6 space-y-4" onSubmit={createProject}>
                            <input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Title (English)" className="w-full rounded-xl border p-4 bg-transparent outline-none" required />
                            <input value={titleAm} onChange={e => titleAm && setTitleAm(e.target.value)} placeholder="Title (Amharic)" className="w-full rounded-xl border p-4 bg-transparent outline-none" required />
                            <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="Thumbnail URL" className="w-full rounded-xl border p-4 bg-transparent outline-none" required />
                            <textarea value={imageUrls} onChange={e => setImageUrls(e.target.value)} placeholder="Gallery URLs (comma separated)" className="w-full rounded-xl border p-4 bg-transparent outline-none min-h-[100px]" />
                            <Button variant="primary" disabled={saving} type="submit">{saving ? "Saving..." : "Create Project"}</Button>
                        </form>
                        {message && <p className="mt-4 text-sm text-center text-blue-500">{message}</p>}
                    </section>

                    <section className={`rounded-3xl border p-6 md:p-8 ${isDark ? "border-white/10 bg-neutral-900" : "border-black/10 bg-white"}`}>
                        <h2 className="text-2xl font-semibold tracking-tight">Project Library</h2>
                        <div className="mt-6 space-y-4">
                            {loadingProjects ? <p>Loading...</p> : projects.map(project => (
                                <article key={project.id} className="rounded-2xl border p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                                    <div className="flex gap-4 items-center">
                                        <div className="relative h-16 w-24 overflow-hidden rounded-lg">
                                            <Image src={project.thumbnailUrl || "/photos/hero.webp"} alt={project.titleEn} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{project.titleEn}</h3>
                                            <p className="text-sm text-neutral-500">{project.titleAm}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => beginEdit(project)}>Edit</Button>
                                        <Button variant="outline" className="text-red-500 border-red-500" onClick={() => deleteProject(project.id)}>Delete</Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
