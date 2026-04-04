import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { GalleryProject } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    const projects = await GalleryProject.find(
      { isPublished: true },
      { _id: 1, titleEn: 1, titleAm: 1, thumbnailUrl: 1, images: 1, displayOrder: 1, createdAt: 1 }
    )
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      count: projects.length,
      projects: projects.map((project) => ({
        id: String(project._id),
        titleEn: project.titleEn,
        titleAm: project.titleAm,
        thumbnailUrl: project.thumbnailUrl,
        images: (project.images || []).map((image, index) => ({
          id: `${String(project._id)}-${index + 1}`,
          imageUrl: image.imageUrl,
        })),
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown gallery lookup error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
