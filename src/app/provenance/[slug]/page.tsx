import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CheckCircle2, HeartHandshake, MapPin, } from "lucide-react";
import { getProvenanceProduct, provenanceProducts, type ProvenanceProduct } from "@/lib/provenance";
import dbConnect from "@/lib/mongodb";
import { ProvenanceProduct as ProvenanceProductModel } from "@/lib/models";

type ProvenancePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return provenanceProducts.map((product) => ({ slug: product.slug }));
}

export const dynamicParams = true;

async function getProduct(slug: string): Promise<ProvenanceProduct | null> {
  // First check static/hardcoded products
  const hardcoded = getProvenanceProduct(slug);
  if (hardcoded) return hardcoded;

  // Then fetch from MongoDB
  try {
    await dbConnect();
    const dbProduct = await ProvenanceProductModel.findOne({
      slug: slug.toLowerCase(),
      isPublished: true,
    }).lean();

    if (!dbProduct) return null;

    return {
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
    };
  } catch (error) {
    console.error("Failed to fetch product from DB:", error);
    return null;
  }
}

export async function generateMetadata({ params }: ProvenancePageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Provenance | Item not found",
    };
  }

  return {
    title: `${product.title} | Provenance`,
    description: `${product.creatorName} and the story behind ${product.title} at ${product.hotelName}.`,
  };
}

export default async function ProvenanceStoryPage({ params }: ProvenancePageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.12),_transparent_30%),linear-gradient(180deg,_#f8f5ef_0%,_#ffffff_100%)] px-6 pb-20 pt-28 text-black dark:bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.22),_transparent_30%),linear-gradient(180deg,_#040404_0%,_#090909_100%)] dark:text-white md:px-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">Product not found</p>
          <h1 className="mt-3 font-serif text-4xl">This provenance item does not exist yet.</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
            The QR code may point to a product that hasn&apos;t been created in the admin dashboard yet. Ask the hotel staff to register this item.
          </p>
          <Link href="/provenance" className="mt-6 inline-flex items-center rounded-full border border-black/15 px-5 py-3 text-xs uppercase tracking-[0.25em] dark:border-white/15">
            Browse all items
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.12),_transparent_30%),linear-gradient(180deg,_#f8f5ef_0%,_#ffffff_100%)] text-black dark:bg-[radial-gradient(circle_at_top,_rgba(201,170,120,0.22),_transparent_30%),linear-gradient(180deg,_#040404_0%,_#090909_100%)] dark:text-white pt-24 md:pt-32">
      <section className="mx-auto w-full max-w-7xl px-6 pb-20 md:px-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/provenance"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-neutral-600 transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to index
          </Link>

        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.45em] text-neutral-500 dark:text-neutral-400">{product.itemType}</p>
              <h2 className="font-serif text-4xl leading-tight md:text-6xl">{product.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <BadgeCheck className="h-4 w-4 text-neutral-600 dark:text-neutral-200" />
                  {product.creatorName}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <MapPin className="h-4 w-4 text-neutral-600 dark:text-neutral-200" />
                  {product.creatorLocation}
                </span>
              </div>
              {product.tipHint && (
                <p className="max-w-3xl text-base leading-8 text-neutral-700 dark:text-neutral-300 md:text-lg">
                  {product.tipHint}
                </p>
              )}
            </div>

            {product.imageUrl ? (
              <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-white/5 dark:shadow-black/40">
                <div className="relative aspect-[16/9]">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/80">Hosted by {product.hotelName}</p>
                    <h3 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-white md:text-4xl">A piece with a traceable journey.</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 md:text-base">{product.origin}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-neutral-100 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-neutral-900/40 dark:shadow-black/40">
                <div className="relative aspect-[16/9]">
                  <img
                    src="https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?auto=format&fit=crop&q=80&w=1200"
                    alt="Default provenance placeholder"
                    className="h-full w-full object-cover opacity-60 grayscale transition-all hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/80">Hosted by {product.hotelName}</p>
                    <h3 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-white md:text-4xl">The story is being written.</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 md:text-base">{product.origin}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
              <div className="absolute bottom-8 left-6 top-16 w-px bg-neutral-200 dark:bg-white/15 md:left-8" />
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">Story arc</p>
              <div className="mt-6 space-y-8">
                {product.origin && (
                  <div className="relative pl-8">
                    <span className="absolute left-[-3px] top-2 h-2 w-2 rounded-full bg-neutral-700 dark:bg-neutral-200" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Where it begins</p>
                    <p className="mt-2 text-sm leading-7 text-neutral-700 dark:text-neutral-300 md:text-base">{product.origin}</p>
                  </div>
                )}
                <div className="relative pl-8">
                  <span className="absolute left-[-3px] top-2 h-2 w-2 rounded-full bg-neutral-700 dark:bg-neutral-200" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">How it is made</p>
                  <p className="mt-2 text-sm leading-7 text-neutral-700 dark:text-neutral-300 md:text-base">{product.story}</p>
                </div>
                {product.impact && (
                  <div className="relative pl-8">
                    <span className="absolute left-[-3px] top-2 h-2 w-2 rounded-full bg-neutral-700 dark:bg-neutral-200" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Why it matters</p>
                    <p className="mt-2 text-sm leading-7 text-neutral-700 dark:text-neutral-300 md:text-base">{product.impact}</p>
                  </div>
                )}
              </div>
            </div>

            {product.materials.length > 0 && (
              <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">What this piece contains</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <span key={material} className="rounded-full border border-black/10 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 dark:border-white/10 dark:bg-black/30 dark:text-neutral-200">
                      {material}
                    </span>
                  ))}
                </div>
                {product.details.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {product.details.map((detail) => (
                      <div key={detail} className="flex items-start gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-neutral-600 dark:text-neutral-200" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Still here?</p>
              <h3 className="mt-3 font-serif text-3xl leading-tight text-black dark:text-white">Want to tip the creator?</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
                If this story made an impact, jump back up and send support directly to the maker.
              </p>
              <Link
                href="#tip"
                className="mt-5 inline-flex items-center justify-center rounded-full border border-amber-700 bg-amber-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-50 transition hover:-translate-y-0.5 hover:bg-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-amber-100/70 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-amber-200"
              >
                Go to tip section
              </Link>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div
              id="tip"
              className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <div>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-neutral-50 shadow-sm dark:border-white/10 dark:bg-black/30">
                    <HeartHandshake className="h-4 w-4" />
                  </span>
                  Tip the creator
                </div>

                <h3 className="mt-4 text-2xl font-semibold leading-snug text-black dark:text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                  Support {product.creatorName}.
                </h3>

                {product.tipHint && (
                  <p className="mt-2 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
                    {product.tipHint}
                  </p>
                )}

                <fieldset className="mt-5">
                  <legend className="sr-only">Choose tip amount</legend>
                  <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 20].map((amount, index) => {
                      const inputId = `tip-${amount}`;

                      return (
                        <div key={amount}>
                          <input
                            id={inputId}
                            type="radio"
                            name="tip-amount"
                            className="peer sr-only"
                            defaultChecked={index === 1}
                          />
                          <label
                            htmlFor={inputId}
                            className="flex cursor-pointer items-center justify-center rounded-full border border-amber-300/70 bg-white/75 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:border-amber-500 hover:bg-white peer-checked:border-amber-700 peer-checked:bg-amber-900 peer-checked:text-amber-50 dark:border-amber-200/25 dark:bg-white/10 dark:text-amber-100 dark:hover:border-amber-200/45 dark:hover:bg-white/15 dark:peer-checked:border-amber-100 dark:peer-checked:bg-amber-100 dark:peer-checked:text-amber-950"
                          >
                            ${amount}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>

                <button
                  type="button"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-amber-700 bg-amber-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-50 transition hover:-translate-y-0.5 hover:bg-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-amber-100/70 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-amber-200"
                >
                  Send tip
                </button>

                <Link
                  href="/provenance"
                  className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-neutral-600 transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
                >
                  View more items
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">Maker profile</p>
              <h3 className="mt-3 font-serif text-3xl text-black dark:text-white">{product.creatorName}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{product.creatorRole}</p>
              {product.tipHint && (
                <p className="mt-4 text-sm leading-7 text-neutral-700 dark:text-neutral-300">{product.tipHint}</p>
              )}

              {product.materials.length > 0 && (
                <>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">At a glance</p>
                  <div className="mt-4 space-y-3">
                    {product.materials.map((material) => (
                      <div key={material} className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <BadgeCheck className="h-4 w-4 text-neutral-600 dark:text-neutral-200" />
                        <span>{material}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
