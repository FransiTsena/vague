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

// --- Pricing Control Model ---
export interface IPricingControl extends Document {
  key: string;
  aiMultiplier: number;
  isActive: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PricingControlSchema = new Schema<IPricingControl>(
  {
    key: { type: String, required: true, unique: true, trim: true, default: "global" },
    aiMultiplier: { type: Number, required: true, default: 1, min: 0.5, max: 2 },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

export const PricingControl: Model<IPricingControl> =
  mongoose.models.PricingControl ||
  mongoose.model<IPricingControl>("PricingControl", PricingControlSchema);

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

// --- Scheduling & Staffing Models ---

export interface IDepartment extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const DepartmentModel: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

export type AccessRole = "ADMIN" | "DEPARTMENT_HEAD" | "MEMBER";

export interface IMember extends Document {
  email: string;
  name: string;
  role?: string;
  accessRole: AccessRole;
  passwordHash?: string;
  portalToken: string;
  departmentId?: mongoose.Types.ObjectId;
  skills: string[];
  availability: {
    dayOfWeek: number; // 0-6
    preferredShifts: ("morning" | "swing" | "night")[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    accessRole: { type: String, enum: ["ADMIN", "DEPARTMENT_HEAD", "MEMBER"], default: "MEMBER" },
    passwordHash: { type: String },
    portalToken: { type: String, required: true, unique: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    skills: [{ type: String }],
    availability: [{
      dayOfWeek: { type: Number, min: 0, max: 6 },
      preferredShifts: [{ type: String, enum: ["morning", "swing", "night"] }]
    }]
  },
  { timestamps: true }
);

export const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);

export interface IScheduleEvent extends Document {
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  departmentId: mongoose.Types.ObjectId;
  organizerId?: mongoose.Types.ObjectId; // Kept for backward compatibility, moving towards staffIds
  staffIds: mongoose.Types.ObjectId[];
  type: "SHIFT" | "EVENT" | "TASK";
  shiftType?: "morning" | "swing" | "night";
  status: "DRAFT" | "PUBLISHED" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleEventSchema = new Schema<IScheduleEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "Member" },
    staffIds: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    type: { type: String, enum: ["SHIFT", "EVENT", "TASK"], default: "EVENT" },
    shiftType: { type: String, enum: ["morning", "swing", "night"] },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "COMPLETED"], default: "PUBLISHED" },
  },
  { timestamps: true }
);

const existingScheduleEventModel = mongoose.models.ScheduleEvent as Model<IScheduleEvent> | undefined;

// In Next.js dev HMR, Mongoose models are cached between edits.
// If ScheduleEvent was compiled before staffIds existed, refresh the model.
if (existingScheduleEventModel && !existingScheduleEventModel.schema.path("staffIds")) {
  mongoose.deleteModel("ScheduleEvent");
}

export const ScheduleEvent: Model<IScheduleEvent> =
  (mongoose.models.ScheduleEvent as Model<IScheduleEvent>) || mongoose.model<IScheduleEvent>("ScheduleEvent", ScheduleEventSchema);

export type DemandStatus = "SCHEDULED" | "PARTIAL";

export interface IStaffingDemand extends Document {
  referenceId?: string;
  startsAt: Date;
  endsAt: Date;
  status: DemandStatus;
  createdAt: Date;
  updatedAt: Date;
}

const StaffingDemandSchema = new Schema<IStaffingDemand>(
  {
    referenceId: { type: String, unique: true, sparse: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ["SCHEDULED", "PARTIAL"], default: "PARTIAL" },
  },
  { timestamps: true }
);

export const StaffingDemand: Model<IStaffingDemand> =
  mongoose.models.StaffingDemand || mongoose.model<IStaffingDemand>("StaffingDemand", StaffingDemandSchema);

export interface IStaffingRequirement extends Document {
  demandId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  requiredCount: number;
  roleName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StaffingRequirementSchema = new Schema<IStaffingRequirement>(
  {
    demandId: { type: Schema.Types.ObjectId, ref: "StaffingDemand", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    requiredCount: { type: Number, required: true, min: 0 },
    roleName: { type: String, trim: true },
  },
  { timestamps: true }
);

export const StaffingRequirement: Model<IStaffingRequirement> =
  mongoose.models.StaffingRequirement || mongoose.model<IStaffingRequirement>("StaffingRequirement", StaffingRequirementSchema);

export interface IStaffAssignment extends Document {
  demandId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StaffAssignmentSchema = new Schema<IStaffAssignment>(
  {
    demandId: { type: Schema.Types.ObjectId, ref: "StaffingDemand", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

export const StaffAssignment: Model<IStaffAssignment> =
  mongoose.models.StaffAssignment || mongoose.model<IStaffAssignment>("StaffAssignment", StaffAssignmentSchema);

// --- Provenance Product Model ---
export interface IProvenanceProduct extends Document {
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
  imageDirection?: string;
  tipHint: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProvenanceProductSchema = new Schema<IProvenanceProduct>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    itemType: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    hotelName: { type: String, default: "VAGUE Resort", trim: true },
    creatorName: { type: String, required: true, trim: true },
    creatorRole: { type: String, required: true, trim: true },
    creatorLocation: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    materials: [{ type: String }],
    story: { type: String, required: true },
    details: [{ type: String }],
    impact: { type: String, default: "" },
    imageUrl: { type: String, required: true, trim: true },
    imageDirection: { type: String, trim: true },
    tipHint: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ProvenanceProduct: Model<IProvenanceProduct> =
  mongoose.models.ProvenanceProduct || mongoose.model<IProvenanceProduct>("ProvenanceProduct", ProvenanceProductSchema);
