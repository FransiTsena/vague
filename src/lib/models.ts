import mongoose, { Schema, Document, Model } from "mongoose";

// --- Activity Schema ---
export interface IActivity {
  type: "restaurant" | "spa" | "bar" | "room_service";
  amount: number;
  date: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    type: { type: String, enum: ["restaurant", "spa", "bar", "room_service"], required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

// --- Price History Schema ---
export interface IPriceHistory {
  date: Date;
  price: number;
}

const priceHistorySchema = new Schema<IPriceHistory>(
  {
    date: { type: Date, default: Date.now },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// --- Guest Model ---
export interface IGuest extends Document {
  name: string;
  phone?: string;
  email: string;
  bookingStatus: "booked" | "checked_in" | "checked_out";
  checkIn: Date;
  checkOut: Date;
  activities: IActivity[];
  stayNights: number;
  totalSpend: number;
  loyaltyScore?: number;
  predictedSegment?: string;
  aiChurnRisk?: number;
  topAmenityPredicted?: string;
  isVip?: boolean;
  preferences?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<IGuest>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    bookingStatus: { type: String, enum: ["booked", "checked_in", "checked_out"], default: "booked" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    activities: [activitySchema],
    loyaltyScore: { type: Number, default: 0 },
    predictedSegment: { type: String, default: "New" },
    totalSpend: { type: Number, default: 0 },
    aiChurnRisk: { type: Number, default: 0 },
    topAmenityPredicted: { type: String, default: "" },
    isVip: { type: Boolean, default: false },
    preferences: [{ type: String }],
  },
  { timestamps: true }
);

GuestSchema.virtual("stayNights").get(function (this: IGuest) {
  if (!this.checkIn || !this.checkOut) return 0;
  return Math.max(0, Math.ceil((this.checkOut.getTime() - this.checkIn.getTime()) / (24 * 60 * 60 * 1000)));
});

GuestSchema.virtual("totalSpend").get(function (this: IGuest) {
  return (this.activities || []).reduce((sum, activity) => sum + (activity.amount || 0), 0);
});

export const Guest: Model<IGuest> = mongoose.models.Guest || mongoose.model<IGuest>("Guest", GuestSchema);

// --- Room Model ---
export interface IRoom extends Document {
  roomNumber: string;
  type: "standard" | "deluxe" | "suite";
  basePrice: number;
  currentPrice: number;
  status: "available" | "booked" | "occupied";
  priceHistory: IPriceHistory[];
  images?: string[];
  description?: string;
  amenities?: string[];
  videoUrl?: string;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, trim: true, unique: true },
    type: { type: String, enum: ["standard", "deluxe", "suite"], required: true },
    basePrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["available", "booked", "occupied"], default: "available" },
    priceHistory: [priceHistorySchema],
    images: [{ type: String }],
    description: { type: String },
    amenities: [{ type: String }],
    videoUrl: { type: String },
  },
  { timestamps: true }
);

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

// --- Booking Model ---
export interface IBooking extends Document {
  guestId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  bookingDate: Date;
  checkIn: Date;
  checkOut: Date;
  pricePaid: number;
  numberOfGuests: number;
  mealPlan?: "room_only" | "breakfast" | "half_board" | "full_board";
  bookingChannel?: "direct" | "ota" | "corporate" | "agent";
  loyaltyTier?: "none" | "silver" | "gold" | "platinum";
  isRefundable?: boolean;
  promoCode?: string;
  specialRequests?: number;
  note?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    guestId: { type: Schema.Types.ObjectId, ref: "Guest", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    bookingDate: { type: Date, default: Date.now },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    pricePaid: { type: Number, required: true, min: 0 },
    numberOfGuests: { type: Number, required: true, min: 1 },
    mealPlan: { type: String, enum: ["room_only", "breakfast", "half_board", "full_board"] },
    bookingChannel: { type: String, enum: ["direct", "ota", "corporate", "agent"] },
    loyaltyTier: { type: String, enum: ["none", "silver", "gold", "platinum"] },
    isRefundable: { type: Boolean, default: false },
    promoCode: { type: String, trim: true, uppercase: true },
    specialRequests: { type: Number, min: 0, max: 5 },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

// --- Calendar Model ---
export interface ICalendar extends Document {
  date: Date;
  isHoliday: boolean;
  event: string;
  demandMultiplier: number;
}

const CalendarSchema = new Schema<ICalendar>(
  {
    date: { type: Date, required: true, unique: true },
    isHoliday: { type: Boolean, default: false },
    event: { type: String, trim: true, default: "" },
    demandMultiplier: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true }
);

export const Calendar: Model<ICalendar> = mongoose.models.Calendar || mongoose.model<ICalendar>("Calendar", CalendarSchema);

// --- Gallery Model ---
export interface IGalleryImage {
  imageUrl: string;
}

const galleryImageSchema = new Schema<IGalleryImage>(
  {
    imageUrl: { type: String, required: true, trim: true },
  },
  { _id: false }
);

export interface IGalleryProject extends Document {
  titleEn: string;
  titleAm: string;
  thumbnailUrl: string;
  images: IGalleryImage[];
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryProjectSchema = new Schema<IGalleryProject>(
  {
    titleEn: { type: String, required: true, trim: true },
    titleAm: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, required: true, trim: true },
    images: [galleryImageSchema],
    isPublished: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const GalleryProject: Model<IGalleryProject> =
  mongoose.models.GalleryProject || mongoose.model<IGalleryProject>("GalleryProject", GalleryProjectSchema);
