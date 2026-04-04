import { NextResponse } from "next/server";
import { getChatResponse } from "@/lib/chat";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    const response = await getChatResponse(messages);
    
    return NextResponse.json({ 
        role: "assistant", 
        content: response || "I'm having a bit of trouble connecting to my hotel systems right now. Can I try that again?" 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
