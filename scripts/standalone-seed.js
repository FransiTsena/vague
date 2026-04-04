import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

// Inline schemas for standalone seeding to ensure reliability
const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
}, { timestamps: true });

const MemberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  role: { type: String },
  accessRole: { type: String, enum: ["ADMIN", "DEPARTMENT_HEAD", "MEMBER"], default: "MEMBER" },
  passwordHash: { type: String },
  portalToken: { type: String, required: true, unique: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  skills: [{ type: String }],
  availability: [{
    dayOfWeek: { type: Number, min: 0, max: 6 },
    preferredShifts: [{ type: String, enum: ["morning", "swing", "night"] }]
  }]
}, { timestamps: true });

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ["standard", "deluxe", "suite"], required: true },
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  status: { type: String, enum: ["available", "booked", "occupied"], default: "available" },
  amenities: [{ type: String }],
  images: [{ type: String }],
  description: { type: String }
}, { timestamps: true });

const GalleryProjectSchema = new mongoose.Schema({
  titleEn: { type: String, required: true },
  titleAm: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  images: [{ imageUrl: String }],
  isPublished: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId }, // Flexible for seed
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  bookingDate: { type: Date, default: Date.now },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  pricePaid: { type: Number, required: true },
  numberOfGuests: { type: Number, default: 1 }
}, { timestamps: true });

const Department = mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
const Member = mongoose.models.Member || mongoose.model("Member", MemberSchema);
const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);
const GalleryProject = mongoose.models.GalleryProject || mongoose.model("GalleryProject", GalleryProjectSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

async function seed() {
  try {
    let uri = MONGODB_URI.replace(/"/g, '');
    if (uri.includes('127.0.0.1') || uri.includes('localhost')) { uri = uri.split('?')[0]; }
    console.log("Connecting to:", uri);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });

    console.log("Cleaning existing database collections...");
    await Promise.all([
      Member.deleteMany({}),
      Department.deleteMany({}),
      Room.deleteMany({}),
      GalleryProject.deleteMany({}),
      Booking.deleteMany({})
    ]);

    // 1. Seed Departments (Enterprise Staffing)
    console.log("Seeding Registry Departments...");
    const depts = [
      { name: "Executive Leadership", description: "Strategic Hotel Operations" },
      { name: "Accommodation Services", description: "Housekeeping and Floor Management" },
      { name: "Culinary & Banquets", description: "Five-star kitchens and events" },
      { name: "Front of House", description: "Guest Services and Concierge" },
      { name: "Plant & Facilities", description: "Engineering and Maintenance" }
    ];
    const savedDepts = await Department.insertMany(depts);

    // 2. Seed Staff (Luxury Workforce)
    console.log("Seeding Workforce (144+ Staff Profiles)...");
    const passwordHash = await bcrypt.hash("changeme", 10);
    
    // Admin
    await Member.create({
      name: "General Manager",
      email: "gm@hotel.local",
      role: "General Manager",
      accessRole: "ADMIN",
      passwordHash,
      portalToken: "gm-admin-token",
      departmentId: savedDepts[0]._id
    });

    for (const d of savedDepts) {
      // Head
      await Member.create({
        name: `${d.name} Head`,
        email: `head.${d.name.toLowerCase().replace(/[^a-z]/g, '')}@hotel.local`,
        role: "Head of Operations",
        accessRole: "DEPARTMENT_HEAD",
        passwordHash,
        portalToken: Math.random().toString(36).substring(7),
        departmentId: d._id,
        skills: ["Management", "Leadership"],
        availability: [0, 1, 2, 3, 4, 5, 6].map(day => ({
          dayOfWeek: day,
          preferredShifts: ["morning", "swing"]
        }))
      });
      // Scaled Staff
      const volume = (d.name.includes("Culinary") || d.name.includes("Accommodation")) ? 25 : 12;
      for (let i = 0; i < volume; i++) {
        await Member.create({
          name: `Staff Member ${i+1} (${d.name})`,
          email: `staff.${d._id.toString().slice(-4)}.${i}@hotel.local`,
          role: "Associate",
          accessRole: "MEMBER",
          portalToken: Math.random().toString(36).substring(7),
          departmentId: d._id,
          skills: ["General Operations", "Service"],
          availability: [0, 1, 2, 3, 4, 5, 6].map(day => ({
            dayOfWeek: day,
            preferredShifts: (i % 3 === 0) ? ["morning"] : (i % 3 === 1) ? ["swing"] : ["night"]
          }))
        });
      }
    }

    // 3. Seed Rooms (Boutique Inventory)
    console.log("Seeding Hotel Room Inventory...");
    const roomTypes = [
      { 
        type: "standard", 
        base: 120, 
        count: 40,
        images: ["https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop"]
      },
      { 
        type: "deluxe", 
        base: 250, 
        count: 20,
        images: ["https://image-tc.galaxy.tf/wijpeg-5u0yspha8pzjgjqtk22jsisol/deluxe-room-land-view_wide.jpg?crop=0%2C100%2C1920%2C1080"]
      },
      { 
        type: "suite", 
        base: 550, 
        count: 10,
        images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1578683010236-d716f9759678?q=80&w=1000&auto=format&fit=crop"]
      }
    ];
    const savedRooms = [];
    for (const rt of roomTypes) {
      for (let i = 1; i <= rt.count; i++) {
        const r = await Room.create({
          roomNumber: `${rt.type === 'standard' ? 1 : rt.type === 'deluxe' ? 2 : 3}${i.toString().padStart(2, '0')}`,
          type: rt.type,
          basePrice: rt.base,
          currentPrice: rt.base,
          status: "available",
          amenities: ["WiFi", rt.type === 'suite' ? "Mini Bar" : "Cable TV"],
          images: rt.images,
          description: `Luxurious ${rt.type} room with city view.`
        });
        savedRooms.push(r);
      }
    }

    // 4. Seed Gallery (Marketing Assets)
    console.log("Seeding Visual Gallery...");
    await GalleryProject.insertMany([
      {
        titleEn: "Presidential Suite Experience",
        titleAm: "የፕሬዝዳንታዊ ስብስብ ልምድ",
        thumbnailUrl: "https://images.unsplash.com/photo-1541971875076-8f970d573be6?q=80&w=1000&auto=format&fit=crop",
        images: [{ imageUrl: "https://images.unsplash.com/photo-1541971875076-8f970d573be6?q=80&w=1000&auto=format&fit=crop" }],
        displayOrder: 1
      },
      {
        titleEn: "Infinity Pool & Lounge",
        titleAm: "ኢንፊኒቲ ገንዳ እና ላውንጅ",
        thumbnailUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000&auto=format&fit=crop",
        images: [{ imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000&auto=format&fit=crop" }],
        displayOrder: 2
      }
    ]);

    // 5. Seed Bookings (AI-Ready Data Patterns for OccupancyAnalytics)
    console.log("Seeding Booking Data (AI Projection Ready)...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingPatterns = [
      { offset: -2, density: 0.3, label: "2 Days Ago" },
      { offset: -1, density: 0.35, label: "Yesterday" },
      { offset: 0, density: 0.45, label: "Today" },
      { offset: 1, density: 0.55, label: "Tomorrow" },
      { offset: 2, density: 0.88, label: "Friday Peak (Surge)" }, 
      { offset: 3, density: 0.94, label: "Saturday Peak (Surge)" },
      { offset: 4, density: 0.65, label: "Sunday" },
      { offset: 5, density: 0.4, label: "Monday" },
      { offset: 6, density: 0.3, label: "Tuesday" },
    ];

    for (const pattern of bookingPatterns) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + pattern.offset);
      
      const totalRoomsCount = savedRooms.length;
      const targetBooked = Math.floor(totalRoomsCount * pattern.density);
      
      const shuffledRooms = [...savedRooms].sort(() => 0.5 - Math.random());
      const selectedForDay = shuffledRooms.slice(0, targetBooked);

      for (const room of selectedForDay) {
        await Booking.create({
          roomId: room._id,
          checkIn: targetDate,
          checkOut: new Date(new Date(targetDate).getTime() + 24 * 60 * 60 * 1000),
          pricePaid: room.currentPrice,
          numberOfGuests: Math.floor(Math.random() * 2) + 1
        });
      }
      console.log(`  - Seeded ${targetBooked} bookings for ${targetDate.toISOString().split('T')[0]} (${pattern.label})`);
    }

    console.log("-----------------------------------------");
    console.log("HMS UNIFIED GLOBAL SEED SUCCESSFUL");
    console.log(`- Staff Profiles Created: ${await Member.countDocuments()}`);
    console.log(`- Room Inventory Created: ${savedRooms.length}`);
    console.log(`- Gallery Projects: 2`);
    console.log(`- AI-Patterned Bookings: ${await Booking.countDocuments()}`);
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("Critical Seeding Failure:", err);
    process.exit(1);
  }
}

seed();
