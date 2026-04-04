export type ProvenanceProductDraft = {
  slug: string;
  itemType: string;
  title: string;
  creatorName: string;
  creatorRole: string;
  creatorLocation: string;
  origin: string;
  materials: string;
  story: string;
  imageUrl: string;
  imageDirection: string;
  tipText: string;
};

export const defaultProvenanceDraft: ProvenanceProductDraft = {
  slug: "sidamo-coffee",
  itemType: "Coffee",
  title: "Sidamo Reserve Coffee",
  creatorName: "Mekdes Alemu",
  creatorRole: "Coffee producer and small-batch roaster",
  creatorLocation: "Sidama Region, Ethiopia",
  origin: "Picked from highland farms near Bensa and finished in a small family roastery.",
  materials: "Highland arabica, spring water processing, hand-sorted beans",
  story: "This cup begins in the cool Ethiopian highlands, where the beans are harvested slowly to preserve sweetness and floral brightness.",
  imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200",
  imageDirection: "Use a clean close-up of the product in warm natural light with visible texture and minimal background clutter.",
  tipText: "A guest tip can be routed directly to the creator's verified payout account.",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
