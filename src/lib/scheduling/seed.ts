import dbConnect from "@/lib/mongodb";
import { DepartmentModel, Member } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function seedStaff() {
  await dbConnect();

  let adminDept = await DepartmentModel.findOne({ name: "Administration" });
  if (!adminDept) {
    adminDept = await DepartmentModel.create({
      name: "Administration",
      description: "System administrators and hotel-wide operations",
    });
  }

  const email = "admin@hotel.local";
  const password = "changeme";
  const passwordHash = await bcrypt.hash(password, 10);

  // Departments
  let culinaryDept = await DepartmentModel.findOne({ name: "Culinary & Banquets" });
  if (!culinaryDept) {
    culinaryDept = await DepartmentModel.create({
      name: "Culinary & Banquets",
      description: "Fine dining and event catering operations",
    });
  }

  let guestServicesDept = await DepartmentModel.findOne({ name: "Guest Services" });
  if (!guestServicesDept) {
    guestServicesDept = await DepartmentModel.create({
      name: "Guest Services",
      description: "Front desk, concierge, and bell service",
    });
  }

  const existing = await Member.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.accessRole = "ADMIN";
    existing.departmentId = adminDept._id as any;
    await existing.save();
  } else {
    await Member.create({
      email,
      name: "General Admin",
      role: "Administrator",
      accessRole: "ADMIN",
      passwordHash,
      portalToken: Math.random().toString(36).substring(7),
      departmentId: adminDept._id,
    });
  }

  // General Manager
  const gmEmail = "gm@hotel.local";
  const gmExisting = await Member.findOne({ email: gmEmail });
  if (!gmExisting) {
    await Member.create({
      email: gmEmail,
      name: "Thomas Miller",
      role: "General Manager",
      accessRole: "ADMIN",
      passwordHash,
      portalToken: "gm-portal",
      departmentId: adminDept._id,
    });
  }

  // Dept Head
  const headEmail = "head.culinarybanquets@hotel.local";
  const headExisting = await Member.findOne({ email: headEmail });
  if (!headExisting) {
    await Member.create({
      email: headEmail,
      name: "Chef Elena Rodriguez",
      role: "Executive Chef",
      accessRole: "DEPT_HEAD",
      passwordHash,
      portalToken: "culinary-head",
      departmentId: culinaryDept._id,
    });
  }

  // Staff
  const staffEmail = "staff.bellman@hotel.local";
  const staffExisting = await Member.findOne({ email: staffEmail });
  if (!staffExisting) {
    await Member.create({
      email: staffEmail,
      name: "James Wilson",
      role: "Bell Captain",
      accessRole: "STAFF",
      passwordHash,
      portalToken: "bell-staff",
      departmentId: guestServicesDept._id,
    });
  }

  return { email, password, gmEmail, headEmail, staffEmail };
}
