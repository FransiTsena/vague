import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ProvenanceProduct } from "@/lib/models";
import { getProvenanceProduct } from "@/lib/provenance";

type RouteParams = {
    params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
    const { slug } = await params;

    try {
        // First check the hardcoded products (demo data fallback)
        const hardcoded = getProvenanceProduct(slug);
        if (hardcoded) {
            return NextResponse.json({ success: true, data: hardcoded, source: "static" });
        }

        // Then check MongoDB
        await dbConnect();
        const product = await ProvenanceProduct.findOne({
            slug: slug.toLowerCase(),
            isPublished: true,
        }).lean();

        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: product, source: "database" });
    } catch (error) {
        console.error("Failed to fetch provenance product:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
