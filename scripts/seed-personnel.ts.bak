import dbConnect from "@/lib/mongodb";
import { seedStaff } from "./src/lib/scheduling/seed";

async function main() {
  console.log("Starting staff seed...");
  try {
    const result = await seedStaff();
    console.log("Success:", result);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
