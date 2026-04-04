import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ProvenanceProduct } from "@/lib/models";

export async function GET() {
    try {
        await dbConnect();
        const products = await ProvenanceProduct.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error("Failed to fetch provenance products:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const {
            slug,
            itemType,
            title,
            creatorName,
            creatorRole,
            creatorLocation,
            origin,
            materials,
            story,
            imageUrl,
            imageDirection,
            tipText,
        } = body;

        if (!slug || !title || !creatorName || !story) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: slug, title, creatorName, story" },
                { status: 400 }
            );
        }

        // Split materials string into array if it's a string
        const materialsList =
            typeof materials === "string"
                ? materials
                    .split(",")
                    .map((m: string) => m.trim())
                    .filter(Boolean)
                : Array.isArray(materials)
                    ? materials
                    : [];

        const productData = {
            slug: slug.toLowerCase().trim(),
            itemType: itemType || "Product",
            title,
            hotelName: "VAGUE Resort",
            creatorName,
            creatorRole: creatorRole || "",
            creatorLocation: creatorLocation || "",
            origin: origin || "",
            materials: materialsList,
            story,
            details: [],
            impact: "",
            imageUrl: imageUrl || "",
            imageDirection: imageDirection || "",
            tipHint: tipText || "",
            isPublished: true,
        };

        // Upsert: update if slug exists, create if not
        const product = await ProvenanceProduct.findOneAndUpdate(
            { slug: productData.slug },
            productData,
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json({
            success: true,
            data: product,
            message: `Product "${product.title}" saved successfully`,
        });
    } catch (error: any) {
        console.error("Failed to save provenance product:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "A product with this slug already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to save product" },
            { status: 500 }
        );
    }
}
