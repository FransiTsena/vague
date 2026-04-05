export type ProvenanceProduct = {
  slug: string;
  itemType: string;
  title: string;
  hotelName: string;
  creatorName: string;
  creatorRole: string;
  creatorLocation: string;
  origin: string;
  materials: string[];
  story: string;
  details: string[];
  impact: string;
  imageUrl: string;
  tipHint: string;
};

export const provenanceProducts: ProvenanceProduct[] = [
  {
    slug: "sidamo-coffee",
    itemType: "Coffee",
    title: "Sidamo Reserve Coffee",
    hotelName: "VAGUE Resort",
    creatorName: "Mekdes Alemu",
    creatorRole: "Coffee producer and small-batch roaster",
    creatorLocation: "Sidama Region, Ethiopia",
    origin: "Picked from highland farms near Bensa and finished in a small family roastery.",
    materials: ["Highland arabica", "Spring water processing", "Hand-sorted beans"],
    story: "This cup begins in the cool Ethiopian highlands, where the beans are harvested slowly to preserve sweetness and floral brightness. At VAGUE Resort, the coffee is presented as part of the room ritual, with the maker's name and origin anchored to the guest experience instead of hidden behind a supplier label.",
    details: ["Washed-process arabica", "Altitude-grown in volcanic soil", "Roasted in small batches for clarity and aroma"],
    impact: "Each purchase keeps value in the local supply chain and gives the guest a direct connection to the grower behind the cup.",
    imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200",
    tipHint: "A guest tip can be routed directly to the creator's verified payout account.",
  },
  {
    slug: "woven-bed-textile",
    itemType: "Textile",
    title: "Handwoven Bed Textile",
    hotelName: "VAGUE Resort",
    creatorName: "Aster Yirga",
    creatorRole: "Master weaver",
    creatorLocation: "Bahir Dar, Ethiopia",
    origin: "Woven on a traditional loom using naturally dyed cotton.",
    materials: ["Cotton thread", "Natural indigo", "Hand-finished fringe"],
    story: "The textile is designed to feel quiet in the room, but rich in detail once scanned. The guest sees the maker's process, the dye work, and the regional technique that shaped the pattern, turning a bed accent into a living story.",
    details: ["Pattern inspired by local ceremonial weaving", "Natural dye palette", "Completed by hand over several days"],
    impact: "The hotel can showcase authentic local art while giving guests a direct line to the maker.",
    imageUrl: "https://images.unsplash.com/photo-1513346940222-3b6a1f0d4e45?auto=format&fit=crop&q=80&w=1200",
    tipHint: "A small tip can acknowledge the craftsmanship instantly.",
  },
  {
    slug: "carved-wood-art",
    itemType: "Art",
    title: "Carved Wood Wall Piece",
    hotelName: "VAGUE Resort",
    creatorName: "Tesfaye Bekele",
    creatorRole: "Wood carver and sculptor",
    creatorLocation: "Hawassa, Ethiopia",
    origin: "Carved from sustainably sourced local hardwood and finished with natural oils.",
    materials: ["Local hardwood", "Natural oil finish", "Hand-carved relief"],
    story: "Placed above the bed or in the lobby, the carving becomes more than decor once scanned. The digital story explains the motif, the technique, and the creator's workshop so the guest can understand the piece as an authored object.",
    details: ["Workshop-led hand carving", "Inspired by regional symbols", "Finished with non-toxic natural oils"],
    impact: "The hotel can showcase local art while giving guests a direct line to the maker.",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
    tipHint: "Tips can be added after the story as a gratitude gesture.",
  },
  {
    slug: "luminary-feathers",
    itemType: "Art",
    title: "Luminary Feathers",
    hotelName: "Le Clos des Oliviers",
    creatorName: "Fransi",
    creatorRole: "Master artisan",
    creatorLocation: "Ancestral lands with a river",
    origin: "Commissioned for the ultra-luxe Le Clos des Oliviers hotel",
    materials: ["Gold leaf", "Bronze", "Polished silver", "Canvas", "Squirrel-hair brush"],
    story: "Fransi's masterpiece, Luminary Feathers, radiates with the essence of light translated through shimmering gold, bronze, and polished silver. Each feather is meticulously intertwined, with the delicate gold leaf applied using a squirrel-hair brush. The central silver spine, symbolizing the river that flows through her ancestral lands, embodies the soul of the artwork. This dramatic composition is a testament to Fransi's skill and reverence for her craft, destined to adorn the walls of the newly opened Le Clos des Oliviers hotel.",
    details: ["Commissioned for the ultra-luxe Le Clos des Oliviers hotel", "Gold leaf applied with a squirrel-hair brush", "Central silver spine symbolizes the river in her ancestral lands"],
    impact: "If this story made an impact, jump back up and send support directly to the maker.",
    imageUrl: "provenance/luminary-feathers",
    tipHint: "A guest tip can be routed directly to Fransi's verified payout account as a appreciation for her remarkable work.",
  }
];

export function getProvenanceProduct(slug: string) {
  return provenanceProducts.find((product) => product.slug === slug) ?? null;
}
