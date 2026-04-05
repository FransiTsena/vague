import Groq from "groq-sdk";
import dbConnect from "@/lib/mongodb";
import { Room } from "@/lib/models";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getChatStream(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
): Promise<any> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  try {
    await dbConnect();
    const rooms = await Room.find({ status: "available" }, { roomNumber: 1, type: 1, currentPrice: 1 }).lean();
    
    let roomContext = "Currently, all rooms are booked or unavailable. Please check back later.";
    if (rooms.length > 0) {
      const roomList = rooms.map(r => `- ${r.type} (Room ${r.roomNumber}): $${r.currentPrice} per night`).join('\n');
      roomContext = `Current available rooms and real-time pricing: \n${roomList}\n\nTo show room cards, append this EXACT tag for EACH room at the VERY end: [[ROOM_CARD:{"roomNumber":"101","type":"Deluxe","price":250,"description":"Ocean view"}]]`;
    } else {
      roomContext = `No rooms in DB. To show multiple demo cards, use: 
      [[ROOM_CARD:{"roomNumber":"101","type":"Deluxe Suite","price":450,"description":"Panoramic ocean views"}]]
      [[ROOM_CARD:{"roomNumber":"102","type":"Penthouse","price":850,"description":"The height of luxury."}]]`;
    }

    return await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are the AI Concierge for VAGUE Resort. 
          1. Help users explore services.
          2. Assist bookings (/booking).
          3. Room Info: ${roomContext}
          4. IMPORTANT: To show room cards, append the tag [[ROOM_CARD:{...}]] for EVERY room you recommended at the VERY end of your response. 
          5. Replace the values with actual data from the room info. 
          6. DO NOT use markdown code blocks or any other formatting for the tags.
          7. If recommending multiple rooms, include multiple [[ROOM_CARD:{...}]] tags in sequence.
          8. Be ultra-concise and luxury-oriented.`
        },
        ...messages
      ],
      model: "llama-3.1-8b-instant",
      stream: true,
    });
  } catch (error) {
    console.error("Groq Chat Error:", error);
    throw error;
  }
}

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
