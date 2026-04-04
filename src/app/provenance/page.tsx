import Link from "next/link";
import { ArrowRight, ArrowUpRight, ScanLine, ShieldCheck, Wallet } from "lucide-react";
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
    <main className="min-h-screen theme-transition bg-white dark:bg-black text-black dark:text-white pt-12 md:pt-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-10 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-neutral-100 dark:border-white/10 pb-12 mb-16 md:mb-24">
          <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-3 opacity-50">
              <ScanLine className="h-3 w-3" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Digital Collection</span>
            </div>
            <h1 className="font-serif text-5xl leading-[1.1] md:text-8xl font-light tracking-tight">
              The <span className="italic text-neutral-400 dark:text-neutral-500">Provenance</span> Archive
            </h1>
            <p className="max-w-2xl text-sm md:text-base leading-relaxed font-light text-neutral-500 dark:text-neutral-400">
              A curated digital record of the artisans and materials that define the VAGUE experience. Scan any room item to unveil its unique architectural journey and heritage.
            </p>
          </div>
          
          <div className="flex md:flex-col items-center md:items-end gap-6 md:gap-3 grayscale opacity-60 font-mono">
            <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-bold order-2 md:order-1">Registry Sync</span>
            <span className="text-[10px] text-foreground flex items-center gap-3 font-medium tracking-widest border border-current px-3 py-1 order-1 md:order-2">
              VERIFIED ORIGIN
            </span>
          </div>
        </div>

        {/* Product Grid - Normal Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {allProducts.map((product, index) => (
            <article
              key={product.slug}
              className="group flex flex-col"
            >
              <Link 
                href={`/provenance/${product.slug}`}
                className="relative aspect-[4/5] w-full overflow-hidden mb-6"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                />
              </Link>
              
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                  {product.itemType}
                </p>
                <h2 className="font-serif text-2xl tracking-tight text-black dark:text-white">
                  {product.title}
                </h2>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-2 font-light">
                  {product.story}
                </p>
                <Link
                  href={`/provenance/${product.slug}`}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold pt-2 hover:opacity-60 transition-opacity"
                >
                  View Entry <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Features Section - Normal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-neutral-100 dark:border-white/10 pt-8 mt-8">
          <div className="space-y-4">
            <h3 className="font-serif text-xl tracking-tight text-black dark:text-white lowercase first-letter:uppercase">
              Algorithmic <span className="italic">Narrative</span>
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 font-light">
              Each entry features a dynamically refined narrative, calibrated to the brand&apos;s architectural tone and the specific heritage of the piece.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-serif text-xl tracking-tight text-black dark:text-white lowercase first-letter:uppercase">
              Verified <span className="italic">Registry</span>
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 font-light">
              Immutable product records linked directly to the physical asset via secure QR protocols, ensuring 100% material transparency.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-serif text-xl tracking-tight text-black dark:text-white lowercase first-letter:uppercase">
              Direct <span className="italic">Patronage</span>
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 font-light">
              An integrated framework allowing for direct creator appreciation, fostering a sustainable link between guest and artisan.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
