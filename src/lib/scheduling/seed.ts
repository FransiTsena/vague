import dbConnect from "@/lib/mongodb";
import { DepartmentModel, Member } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function seedStaff() {
  await dbConnect();

  // Clear existing to ensure clean seed
  await Member.deleteMany({ email: { $ne: "admin@hotel.local" } });
  await DepartmentModel.deleteMany({});

  const depts = [
    { name: "Administration", description: "System administrators and hotel-wide operations" },
    { name: "Culinary & Banquets", description: "Fine dining and event catering operations" },
    { name: "Guest Services", description: "Front desk, concierge, and bell service" },
    { name: "Housekeeping", description: "In-room services and cleaning" },
    { name: "Security", description: "Hotel safety and surveillance" },
  ];

  const createdDepts: any = {};
  for (const d of depts) {
    createdDepts[d.name] = await DepartmentModel.create(d);
  }

  const password = "changeme";
  const passwordHash = await bcrypt.hash(password, 10);

  // Admin
  const adminEmail = "admin@hotel.local";
  const existingAdmin = await Member.findOne({ email: adminEmail });
  if (existingAdmin) {
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.accessRole = "ADMIN";
    existingAdmin.departmentId = createdDepts["Administration"]._id;
    await existingAdmin.save();
  } else {
    await Member.create({
      email: adminEmail,
      name: "Global Admin",
      role: "System Administrator",
      accessRole: "ADMIN",
      passwordHash,
      portalToken: "admin-root",
      departmentId: createdDepts["Administration"]._id,
      skills: ["IT", "Management", "Operations"],
      availability: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        preferredShifts: ["morning", "swing", "night"]
      }))
    });
  }

  const staffData = [
    {
      email: "gm@hotel.local",
      name: "Thomas Miller",
      role: "General Manager",
      accessRole: "ADMIN",
      dept: "Administration",
      skills: ["Leadership", "Strategy"],
    },
    {
      email: "chef.elena@hotel.local",
      name: "Elena Rodriguez",
      role: "Executive Chef",
      accessRole: "DEPARTMENT_HEAD",
      dept: "Culinary & Banquets",
      skills: ["French Cuisine", "Inventory"],
    },
    {
      email: "chef.marcus@hotel.local",
      name: "Marcus Thorne",
      role: "Sous Chef",
      accessRole: "MEMBER",
      dept: "Culinary & Banquets",
      skills: ["Pastry", "Line Prep"],
    },
    {
      email: "front.sarah@hotel.local",
      name: "Sarah Jenkins",
      role: "Front Office Manager",
      accessRole: "DEPARTMENT_HEAD",
      dept: "Guest Services",
      skills: ["Customer Relations", "PMS Specialist"],
    },
    {
      email: "guest.carlos@hotel.local",
      name: "Carlos Mendez",
      role: "Front Desk Agent",
      accessRole: "MEMBER",
      dept: "Guest Services",
      skills: ["Multilingual", "Check-in"],
    },
    {
      email: "house.marta@hotel.local",
      name: "Marta Silva",
      role: "Housekeeping Supervisor",
      accessRole: "DEPARTMENT_HEAD",
      dept: "Housekeeping",
      skills: ["Quality Control", "Staffing"],
    },
    {
      email: "sec.robert@hotel.local",
      name: "Robert Black",
      role: "Security Chief",
      accessRole: "DEPARTMENT_HEAD",
      dept: "Security",
      skills: ["Emergency Response", "Surveillance"],
    }
  ];

  for (const s of staffData) {
    await Member.create({
      email: s.email,
      name: s.name,
      role: s.role,
      accessRole: s.accessRole,
      passwordHash,
      portalToken: s.email.split("@")[0] + "-token",
      departmentId: createdDepts[s.dept]._id,
      skills: s.skills,
      availability: [0, 1, 2, 3, 4, 5, 6].map(day => ({
        dayOfWeek: day,
        preferredShifts: (day < 5) ? ["morning", "swing"] : ["night"]
      }))
    });
  }

  return { status: "Success", usersSeeded: staffData.length + 1 };
}
