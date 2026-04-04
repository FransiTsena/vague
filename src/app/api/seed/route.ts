import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Guest, Room, Booking, Calendar, GalleryProject } from "@/lib/models";

const roomTypes = ["standard", "deluxe", "suite"] as const;

const roomDataMap = {
  standard: {
    images: [
      "https://kuriftu-media.s3.amazonaws.com/Entoto/entoto27.jpg",
      "https://images.unsplash.com/photo-1582719478250-c89400bb13d1?auto=format&fit=crop&w=1920&q=80"
    ],
    videoUrl: "https://www.youtube.com/embed/p_GfI4B3X1A",
    description: "Carefully hidden amongst the eucalyptus trees, our Kuriftu Glamping site offers guests a quiet escape from reality with nothing but the natural world surrounding. With hammocks suspended over the room decks, outdoor grilling stations and mountain bikes provided per room, guests can relax in pure nature.",
    amenities: ["Double Twin Or Queen Size Bed", "Mountain Bicycles", "Outdoor Grill", "Hammock", "Steam, Sauna & Jacuzzi"]
  },
  deluxe: {
    images: [
      "https://kuriftu-media.s3.amazonaws.com/bishoftu/acc/7.webp",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1920&q=80"
    ],
    videoUrl: "https://www.youtube.com/embed/H37B2b8xQIE",
    description: "Overlooking the stunning Kuriftu Lake, these rooms are perfect for romance, relaxation, or family bonding. With breathtaking views and exceptional service, your escape awaits!",
    amenities: ["Private Bathroom With A Shower", "Lake View", "Tea And Coffee Maker", "Wifi", "Safe"]
  },
  suite: {
    images: [
      "https://kuriftu-media.s3.amazonaws.com/Entoto/acc/2.webp",
      "https://kuriftu-media.s3.amazonaws.com/bishoftu/acc/18.webp",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1920&q=80"
    ],
    videoUrl: "https://www.youtube.com/embed/Y12bL0nB20o",
    description: "Nestled deep in the forest, Kuriftu Oasis is your private escape—perfect for romance, adventure, or gathering with loved ones. Fire up the grill, stock the bar, and soak in starlit skies. Unwind, connect, and let the journey begin!",
    amenities: ["King Size Bed / Electric Bed Warmer", "Indoor Fireplace", "Two Mountain Bicycles", "Outdoor Grill", "Hammock", "Mini Bar"]
  }
};

const activityTypes = ["restaurant", "spa", "bar", "room_service"] as const;

const demoGalleryProjects = [
  {
    titleEn: "Sunrise Suite",
    titleAm: "የፀሐይ መውጫ ሱይት",
    thumbnailUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200",
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1631049552240-59c37f38802b?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1600" },
    ],
  },
  {
    titleEn: "Lagoon Pool",
    titleAm: "የላጉን ፑል",
    thumbnailUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=1200",
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1600" },
    ],
  },
  {
    titleEn: "Skyline Dining",
    titleAm: "የሰማይ ምግብ ቤት",
    thumbnailUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200",
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=1600" },
    ],
  },
  {
    titleEn: "Garden Villas",
    titleAm: "የአትክልት ቪላዎች",
    thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600" },
    ],
  },
  {
    titleEn: "Spa Retreat",
    titleAm: "ስፓ ሪትሪት",
    thumbnailUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1200",
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=1600" },
    ],
  },
  {
    titleEn: "Private Terrace",
    titleAm: "የግል ቴራስ",
    thumbnailUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200",
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1600" },
    ],
  },
  {
    titleEn: "Evening Lounge",
    titleAm: "የማታ ላውንጅ",
    thumbnailUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=1200",
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1616594039964-8f14f0b22f1d?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1541542684-4a8f9db4f50a?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?auto=format&fit=crop&q=80&w=1600" },
    ],
  },
  {
    titleEn: "Family Moments",
    titleAm: "የቤተሰብ ደስታ",
    thumbnailUrl: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=1200",
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1600" },
      { imageUrl: "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&q=80&w=1600" },
    ],
  },
] as const;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(array: readonly T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function randomDate(startDate: Date, endDate: Date) {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function POST(request: Request) {
  try {
    const {
      guestCount = 10,
      roomCount = 5,
      bookingCount = 20,
      calendarCount = 30,
      galleryCount = demoGalleryProjects.length,
    } = await request.json();

    await dbConnect();

    // Clear and Seed Rooms
    await Room.deleteMany({});
    const rooms = [];
    
    // Inclusion: Multi-language descriptions for some rooms
    const descriptionsEn = {
      standard: "Carefully hidden amongst the eucalyptus trees, our Kuriftu Glamping site offers guests a quiet escape from reality with nothing but the natural world surrounding. With hammocks suspended over the room decks, outdoor grilling stations and mountain bikes provided per room, guests can relax in pure nature.",
      deluxe: "Overlooking the stunning Kuriftu Lake, these rooms are perfect for romance, relaxation, or family bonding. With breathtaking views and exceptional service, your escape awaits!",
      suite: "Nestled deep in the forest, Kuriftu Oasis is your private escape—perfect for romance, adventure, or gathering with loved ones. Fire up the grill, stock the bar, and soak in starlit skies. Unwind, connect, and let the journey begin!"
    };

    // Generate exactly 15 inclusive rooms: 5 standard, 5 deluxe, 5 suites.
    for (let t = 0; t < roomTypes.length; t++) {
      const type = roomTypes[t];
      for (let i = 0; i < 5; i++) {
        const basePrice = type === "suite" ? 450 : type === "deluxe" ? 280 : 150;
        const data = roomDataMap[type];
        
        // Logical update: Only the very last room in the whole set will be 'booked'
        // All others (the first 14) will be 'available'
        const isLastRoomOverall = t === roomTypes.length - 1 && i === 4;
        const status = isLastRoomOverall ? "booked" : "available";
        
        const doc = {
          roomNumber: String(1000 + (t * 100) + i),
          type,
          basePrice,
          currentPrice: basePrice,
          status,
          priceHistory: [{ date: new Date(), price: basePrice }],
          images: data.images,
          description: descriptionsEn[type],
          amenities: [
            ...data.amenities, 
            "Wheelchair Accessible", 
            "Family Friendly", 
            "High-Speed Wi-Fi", 
            i % 2 === 0 ? "Smart Home Controls" : "Traditional Decor"
          ],
          videoUrl: data.videoUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await Room.collection.insertOne(doc);
        rooms.push({ _id: result.insertedId, ...doc });
      }
    }

    // Clear and Seed Gallery Projects
    await GalleryProject.deleteMany({});
    const galleryToSeed = demoGalleryProjects.slice(0, Math.max(0, Math.min(galleryCount, demoGalleryProjects.length)));

    if (galleryToSeed.length > 0) {
      await GalleryProject.insertMany(
        galleryToSeed.map((project, index) => ({
          titleEn: project.titleEn,
          titleAm: project.titleAm,
          thumbnailUrl: project.thumbnailUrl,
          images: project.images,
          isPublished: true,
          displayOrder: index,
        }))
      );
    }

    // Clear and Seed Guests
    await Guest.deleteMany({});
    const guests: any[] = [];
    const diverseNames = [
        "Abebech Gobena", "Eleanor Vance", "Tewodros Kassahun", "Michael Chang",
        "Sofia Rossi", "Omar Al-Fayed", "Li Wei", "Fatima Mensah", "James Wilson",
        "Yodit Assefa", "Kenji Tanaka", "Aisha Patel", "Dawit Bekele", "Chloe Smith",
        "Zenebech Tadesse", "Marcus Aurelius", "Hana Yohannes", "Suresh Kumar",
        "Elena Petrova", "Amara Okafor", "Yuki Sato", "Mateo Garcia"
    ];
    const segmentTypes = ["VIP", "Corporate", "Leisure", "Loyalty", "New"];
    
    for (let i = 0; i < guestCount; i++) {
      const checkIn = randomDate(new Date(2025, 0, 1), new Date(2026, 11, 15));
      const checkOut = addDays(checkIn, randomInt(1, 12));
      const totalActivitiesSpend = randomInt(50, 1500);
      
      guests.push(await Guest.create({
        name: diverseNames[i % diverseNames.length] + (i >= diverseNames.length ? ` ${i}` : ""),
        email: `guest${i + 1}@${pick(["gmail.com", "corporate.com", "outlook.com", "icloud.com"])}`,
        bookingStatus: pick(["booked", "checked_in", "checked_out"]),
        checkIn,
        checkOut,
        loyaltyScore: randomInt(10, 100),
        predictedSegment: pick(segmentTypes),
        totalSpend: randomInt(500, 5000) + totalActivitiesSpend,
        aiChurnRisk: randomInt(1, 100),
        topAmenityPredicted: pick(["Spa Lounge", "Fine Dining", "Gym Access", "Private Terrace", "Late Checkout"]),
        activities: Array.from({ length: randomInt(1, 5) }, () => ({
          type: pick(activityTypes),
          amount: Number(randomInt(20, 400).toFixed(2)),
          date: randomDate(checkIn, checkOut),
        })),
        isVip: Math.random() < 0.1,
        preferences: [pick(["Quiet Room", "Near Elevator", "Non-Smoking", "High Floor", "Pool View"])],
      }));
    }

    // Clear and Seed Calendar
    await Calendar.deleteMany({});
    const baseStartDate = new Date(2025, 0, 1);
    const holidays = [
      { month: 0, date: 7, name: "Genna (Ethiopian Christmas)" },
      { month: 0, date: 19, name: "Timkat (Ethiopian Epiphany)" },
      { month: 2, date: 2, name: "Adwa Victory Day" },
      { month: 3, date: 18, name: "Ethiopian Good Friday" },
      { month: 3, date: 20, name: "Ethiopian Easter (Fasika)" },
      { month: 8, date: 11, name: "Enkutatash (Ethiopian New Year)" },
      { month: 8, date: 27, name: "Meskel (Finding of the True Cross)" },
      { month: 11, date: 25, name: "International Christmas" },
    ];

    for (let i = 0; i < 365; i++) {
      const date = addDays(baseStartDate, i);
      const holidayMatch = holidays.find(h => h.month === date.getMonth() && h.date === date.getDate());
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      let multiplier = 1.0;
      if (holidayMatch) multiplier = 1.8 + Math.random() * 0.4;
      else if (isWeekend) multiplier = 1.2 + Math.random() * 0.2;
      else multiplier = 0.9 + Math.random() * 0.3;

      await Calendar.create({
        date,
        isHoliday: !!holidayMatch,
        event: holidayMatch ? holidayMatch.name : isWeekend ? "Weekend Peak" : "",
        demandMultiplier: multiplier,
      });
    }

    // Seed Bookings with realistic distribution
    await Booking.deleteMany({});
    const targetBookingCount = Math.max(bookingCount, 50);
    const channels: ("direct" | "ota" | "corporate" | "agent")[] = ["direct", "ota", "corporate", "agent"];
    const mealPlans: ("room_only" | "breakfast" | "half_board" | "full_board")[] = ["room_only", "breakfast", "half_board", "full_board"];

    for (let i = 0; i < targetBookingCount; i++) {
      const guest = pick(guests);
      const room = pick(rooms);
      
      // Future and Past bookings
      const bookingDate = randomDate(new Date(2024, 0, 1), new Date(2025, 0, 1));
      const checkInOffset = randomInt(-30, 200); // Some past, mostly future relative to Jan 2025
      const checkIn = addDays(baseStartDate, checkInOffset);
      const nights = randomInt(1, 7);
      const checkOut = addDays(checkIn, nights);
      
      const channel = pick(channels);
      const mealPlan = pick(mealPlans);
      const numGuests = randomInt(1, room.type === "suite" ? 4 : 2);
      
      // Calculate realistic price paid based on base price + multiplier approx
      const pricePaid = (room.basePrice * (1.1 + Math.random() * 0.4)) * nights;

      await Booking.create({
        guestId: guest._id,
        roomId: room._id,
        bookingDate,
        checkIn,
        checkOut,
        pricePaid,
        numberOfGuests: numGuests,
        bookingChannel: channel,
        mealPlan,
        specialRequests: randomInt(0, 3) > 1 ? randomInt(1, 3) : 0,
      });
    }

    return NextResponse.json({
      message: "Database seeded successfully!",
      seeded: {
        guests: guestCount,
        rooms: rooms.length,
        bookings: bookingCount,
        calendarDays: calendarCount,
        galleryProjects: galleryToSeed.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error during seeding.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

