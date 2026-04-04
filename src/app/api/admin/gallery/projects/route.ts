import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { GalleryProject } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    const projects = await GalleryProject.find(
      {},
      { _id: 1, titleEn: 1, titleAm: 1, thumbnailUrl: 1, images: 1, createdAt: 1, displayOrder: 1 }
    )
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      projects: projects.map((project) => ({
        id: String(project._id),
        titleEn: project.titleEn,
        titleAm: project.titleAm,
        thumbnailUrl: project.thumbnailUrl,
        images: (project.images || []).map((img, idx) => ({
          id: `${String(project._id)}-img-${idx}`,
          imageUrl: img.imageUrl,
        })),
        createdAt: project.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { titleEn, titleAm, thumbnailUrl, images } = body;

    const project = await GalleryProject.create({
      titleEn,
      titleAm,
      thumbnailUrl,
      images: (images || []).map((url: string) => ({ imageUrl: url })),
    });

    return NextResponse.json({
      message: "Project created successfully",
      project: {
        id: String(project._id),
        titleEn: project.titleEn,
        titleAm: project.titleAm,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
