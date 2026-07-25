import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedAdminsFromJSON = async () => {
  try {
    // 1. Pehle hi check kar lo ki koi ADMIN database me pehle se hai ya nahi
    const adminCount = await User.countDocuments({ role: "ADMIN" });

    if (adminCount > 0) {
      console.log("ℹ️ Database me Admins pehle se seeded hain. Skipping...");
      return; // Code yahan se turant wapas chala jayega, aage nahi badhega
    }

    // 2. Agar koi Admin nahi hai, tabhi admins.json read karein
    const jsonPath = path.join(__dirname, "admins.json");

    if (!fs.existsSync(jsonPath)) {
      console.log(`⚠️ admins.json file nahi mili: ${jsonPath}`);
      return;
    }

    const adminsList = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@12345";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    for (const admin of adminsList) {
      const emailClean = admin.email.toLowerCase().trim();

      await User.create({
        name: admin.name.trim(),
        email: emailClean,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      });
      console.log(`✅ First-time Admin created: ${admin.name} (${emailClean})`);
    }

    console.log("🎉 Initial seeding finished successfully!");
  } catch (error) {
    console.error("❌ Error in seedAdminsFromJSON:", error.message);
  }
};
  