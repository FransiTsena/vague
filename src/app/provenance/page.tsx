import Link from "next/link";
import { ArrowRight, ScanLine, ShieldCheck, Wallet } from "lucide-react";
import { provenanceProducts, type ProvenanceProduct } from "@/lib/provenance";
import dbConnect from "@/lib/mongodb";
import { ProvenanceProduct as ProvenanceProductModel } from "@/lib/models";

async function getAllProducts(): Promise<ProvenanceProduct[]> {
  // Start with hardcoded demo products
  const allProducts: ProvenanceProduct[] = [];
  const existingSlugs = new Set();

  // Fetch DB products
  try {
    await dbConnect();
    const dbProducts = await ProvenanceProductModel.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

    for (const dbProduct of dbProducts) {
      if (!existingSlugs.has(dbProduct.slug)) {
        allProducts.push({
          slug: dbProduct.slug,
          itemType: dbProduct.itemType,
          title: dbProduct.title,
          hotelName: dbProduct.hotelName || "VAGUE Resort",
          creatorName: dbProduct.creatorName,
          creatorRole: dbProduct.creatorRole,
          creatorLocation: dbProduct.creatorLocation,
          origin: dbProduct.origin,
          materials: dbProduct.materials || [],
          story: dbProduct.story,
          details: dbProduct.details || [],
          impact: dbProduct.impact || "",
          imageUrl: dbProduct.imageUrl,
          tipHint: dbProduct.tipHint || "",
        });
        existingSlugs.add(dbProduct.slug);
      }
    }
  } catch (error) {
    console.error("Failed to fetch DB provenance products:", error);
  }

  return allProducts;
}

export const dynamic = "force-dynamic";

export default async function ProvenanceIndexPage() {
  const allProducts = await getAllProducts();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.18),_transparent_34%),linear-gradient(180deg,_#050505_0%,_#090909_100%)] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-20 pt-28 md:px-12">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-neutral-300">
            <ScanLine className="h-4 w-4" />
            QR dynamic routing demo
          </span>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">
            Provenance turns scanned room items into product-specific stories.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
            Each QR code resolves to a dynamic route like <span className="text-white">/provenance/[slug]</span>, so the guest sees the exact coffee, textile, or artwork they scanned, along with the maker&apos;s story and a tip action.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {allProducts.map((product, index) => (
            <article
              key={product.slug}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition duration-300 hover:border-white/20 hover:bg-white/8"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-neutral-200">
                  Item 0{index + 1}
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">{product.itemType}</p>
                  <h2 className="mt-2 font-serif text-2xl text-white">{product.title}</h2>
                  <p className="mt-1 text-sm text-neutral-300">{product.creatorName}</p>
                </div>
                <p className="text-sm leading-6 text-neutral-400">{product.story}</p>
                <Link
                  href={`/provenance/${product.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:text-neutral-300"
                >
                  Open story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mt-4 font-serif text-2xl text-white">AI-generated story</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">The route can generate a refined story from verified product data while keeping the tone aligned with the hotel brand.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <ShieldCheck className="h-5 w-5 text-neutral-300" />
            <h3 className="mt-4 font-serif text-2xl text-white">Verified provenance</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">Only the item record attached to the QR code is shown, so guests see the exact maker, origin, and materials tied to that product.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <Wallet className="h-5 w-5 text-neutral-300" />
            <h3 className="mt-4 font-serif text-2xl text-white">Tip-ready flow</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">The page is structured for future payment integrations so a guest can tip the creator after reading the story.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
