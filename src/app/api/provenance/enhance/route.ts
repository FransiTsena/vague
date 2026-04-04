import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type EnhanceableField = "origin" | "materials" | "story" | "tipText" | "imageDirection";

type EnhanceRequestBody = {
  field?: EnhanceableField;
  value?: string;
  draft?: Record<string, unknown>;
};

const VALID_FIELDS: EnhanceableField[] = ["origin", "materials", "story", "tipText", "imageDirection"];

function refineWithoutAI(field: EnhanceableField, value: string): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  if (field === "materials") {
    return cleaned
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnhanceRequestBody;
    const field = body.field;
    const value = (body.value ?? "").trim();
    const draft = body.draft ?? {};

    if (!field || !VALID_FIELDS.includes(field)) {
      return NextResponse.json({ error: "Invalid field." }, { status: 400 });
    }

    if (!value) {
      return NextResponse.json({ error: "Missing value to enhance." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ refinedText: refineWithoutAI(field, value), usedFallback: true });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert hospitality copy editor for premium provenance stories. Rewrite only the requested field. Keep facts grounded in provided data. Do not invent names, places, claims, or certifications. Keep tone refined, warm, and concise. Return JSON only: { \"refinedText\": \"string\" }.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Enhance one provenance field for admin dashboard",
            field,
            value,
            draft,
            constraints:
              field === "imageDirection"
                ? "Return 2-3 concise sentences with practical image styling guidance for a luxury mobile landing page."
                : "Keep under 90 words. Preserve core meaning and facts.",
          }),
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}") as { refinedText?: string };
    const refinedText = (parsed.refinedText || "").trim();

    if (!refinedText) {
      return NextResponse.json({ refinedText: refineWithoutAI(field, value), usedFallback: true });
    }

    return NextResponse.json({ refinedText, usedFallback: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to enhance text.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
