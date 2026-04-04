import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getChatResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
): Promise<string | null> {
  if (!process.env.GROQ_API_KEY) {
    return "I'm currently offline. Please try again later.";
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are the AI Concierge for VAGUE Resort. 
          Your goals:
          1. Help users explore hotel services (ocean-view suites, wellness, fine dining, etc.).
          2. Assist with bookings. If they want to book, tell them you can take them to the booking page.
          3. If they ask for a human, provide this contact: +251 929 945 151.
          4. Be luxury-oriented, helpful, and concise.
          
          Current environment: VAGUE Resort, luxury destination.
          Human Contact: +251 929 945 151
          Booking URL: /booking
          `
        },
        ...messages
      ],
      model: "llama-3.1-8b-instant",
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return null;
  }
}
