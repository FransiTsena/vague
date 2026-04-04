import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { slugify } from "@/lib/provenance-admin";

type ProvenanceDraftPayload = {
  slug?: string;
  itemType?: string;
  title?: string;
  creatorName?: string;
  creatorRole?: string;
  creatorLocation?: string;
  origin?: string;
  materials?: string;
  story?: string;
  imageUrl?: string;
  imageDirection?: string;
  tipText?: string;
};

type GenerateRequestBody = {
  description?: string;
  draft?: ProvenanceDraftPayload;
};

function fallbackDraft(description: string, draft: ProvenanceDraftPayload) {
  const mergedTitle = draft.title?.trim() || "Local Artisan Product";
  return {
    itemType: draft.itemType?.trim() || "Local Good",
    title: mergedTitle,
    creatorName: draft.creatorName?.trim() || "Local Artisan",
    creatorRole: draft.creatorRole?.trim() || "Independent craft maker",
    creatorLocation: draft.creatorLocation?.trim() || "Regional workshop",
    origin: draft.origin?.trim() || description,
    materials: draft.materials?.trim() || "Hand-selected local materials",
    story:
      draft.story?.trim() ||
      `${description.trim()} This product reflects local craft traditions and gives guests a deeper connection to the maker behind the experience.`,
    imageUrl: draft.imageUrl?.trim() || "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200",
    imageDirection:
      draft.imageDirection?.trim() ||
      "Use a clear, close-up composition in warm natural light. Highlight texture and craftsmanship with a clean background.",
    tipText:
      draft.tipText?.trim() ||
      "If this story moved you, leave a tip to support the creator directly.",
    slug: slugify(mergedTitle),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const description = (body.description ?? "").trim();
    const draft = body.draft ?? {};

    if (!description) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ generatedDraft: fallbackDraft(description, draft), usedFallback: true });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert luxury hospitality storyteller writing provenance product copy. From one short admin description, generate a complete and polished draft for a QR-linked product page. Use vivid but factual storytelling. Do not invent certifications, legal claims, or unverifiable promises. Return JSON only with keys: itemType, title, creatorName, creatorRole, creatorLocation, origin, materials, story, imageDirection, tipText.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate full provenance draft from one description",
            description,
            currentDraft: draft,
            style: {
              storytelling: "best-in-class hospitality storytelling",
              tone: "premium, human, culturally respectful",
              storyLength: "120-180 words",
              constraints: [
                "Keep details plausible and grounded in provided input",
                "materials should be a concise comma-separated line",
                "tipText should be one sentence",
                "imageDirection should be 2 short practical sentences",
              ],
            },
          }),
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}") as ProvenanceDraftPayload;
    const generatedDraft = {
      ...fallbackDraft(description, draft),
      ...parsed,
    };

    generatedDraft.slug = slugify(generatedDraft.title || "local-artisan-product");

    return NextResponse.json({ generatedDraft, usedFallback: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate draft.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
