import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Basic in-memory cache for development sessions
const aiCache = new Map<string, { value: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

interface DynamicPricingPrediction {
  multiplier?: number;
  reason?: string;
}

interface GuestSegmentPrediction {
  segment?: string;
  loyaltyScore?: number;
  insight?: string;
}

function getCacheKey(prefix: string, context: any): string {
  return `${prefix}:${JSON.stringify(context)}`;
}

export async function getDynamicPricingPrediction(
  context: Record<string, unknown>,
): Promise<DynamicPricingPrediction | null> {
  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is missing. Falling back to rule-based logic.");
    return null;
  }

  const cacheKey = getCacheKey("pricing", context);
  const cached = aiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a hotel revenue management expert. Use all provided variables (occupancy, lead time, stay length, meal plan, loyalty tier, booking channel, weekend share, holidays/events, demand trend, volatility, refundable policy, promo code, special requests). Return ONLY valid JSON: { \"multiplier\": number, \"reason\": \"string\" }. Keep multiplier between 0.85 and 1.35, where 1 means no adjustment to the provided rule-based rate.",
        },
        {
          role: "user",
          content: JSON.stringify(context),
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || "{}",
    ) as DynamicPricingPrediction;
    
    aiCache.set(cacheKey, { value: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Groq API Error:", error);
    return null;
  }
}

interface SmartSchedulePrediction {
  suggestedStaffCount: number;
  reasoning: string;
  riskLevel: "low" | "medium" | "high";
}

export async function getSmartStaffingPrediction(
  context: {
    department: string;
    occupancyRate: number;
    upcomingBookings: number;
    activeEvents: string[];
    historicalDemand: string;
  }
): Promise<SmartSchedulePrediction | null> {
  if (!process.env.GROQ_API_KEY) return null;

  const cacheKey = getCacheKey("staffing", context);
  const cached = aiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a hotel workforce optimization AI. Calculate ideal staffing for a given department. 
          Consider occupancy, event intensity, and service standards. 
          Return ONLY JSON: { "suggestedStaffCount": number, "reasoning": "string", "riskLevel": "low|medium|high" }.`
        },
        {
          role: "user",
          content: JSON.stringify(context),
        },
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    ) as SmartSchedulePrediction;

    aiCache.set(cacheKey, { value: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Smart Staffing AI Error:", error);
    return null;
  }
}

export async function predictGuestSegment(
  guestData: Record<string, unknown>,
): Promise<GuestSegmentPrediction | null> {
  if (!process.env.GROQ_API_KEY) return null;

  const cacheKey = getCacheKey("segment", guestData);
  const cached = aiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Categorize this hotel guest into a persona and provide a loyalty score (0-100). Return ONLY JSON: { \"segment\": \"string\", \"loyaltyScore\": number, \"insight\": \"string\" }",
        },
        {
          role: "user",
          content: JSON.stringify(guestData),
        },
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || "{}",
    ) as GuestSegmentPrediction;

    aiCache.set(cacheKey, { value: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Groq AI Error:", error);
    return null;
  }
}
