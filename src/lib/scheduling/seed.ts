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

  return { email, password };
}
