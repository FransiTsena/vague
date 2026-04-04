import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { GalleryProject } from "@/lib/models";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    await dbConnect();
    const { projectId } = await params;
    const body = await request.json();
    const { titleEn, titleAm } = body;

    const project = await GalleryProject.findByIdAndUpdate(
      projectId,
      { $set: { titleEn, titleAm } },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project updated successfully", project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    await dbConnect();
    const { projectId } = await params;

    const project = await GalleryProject.findByIdAndDelete(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
