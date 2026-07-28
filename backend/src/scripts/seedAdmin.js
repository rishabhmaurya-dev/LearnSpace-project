import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { User } from "../models/User.model.js";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const seedAdmins = async () => {
  try {
    // 1. Connect to MongoDB Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for Seeding Admins");

    // 2. Read admins.json File
    const jsonPath = path.join(process.cwd(), "src", "scripts", "admins.json");

    if (!fs.existsSync(jsonPath)) {
      console.error("❌ Error: 'src/scripts/admins.json' file not found!");
      process.exit(1);
    }

    const adminsData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(
      `🚀 Found ${adminsData.length} admin(s) in JSON file. Processing...\n`,
    );

    // 3. Loop & Save to Database
    for (const admin of adminsData) {
      const existingUser = await User.findOne({
        email: admin.email.toLowerCase(),
      });

      // Hash raw password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);

      if (existingUser) {
        // Update existing user with schema matching fields
        await User.findOneAndUpdate(
          { email: admin.email.toLowerCase() },
          {
            name: admin.name,
            password: hashedPassword,
            role: "ADMIN", // Enforces "ADMIN" enum
            isActive: admin.isActive ?? true,
            tokenVersion: admin.tokenVersion ?? 0,
          },
          { returnDocument: "after", runValidators: true },
        );
        console.log(`🔄 Updated Admin: ${admin.email}`);
      } else {
        // Create new admin document
        await User.create({
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: "ADMIN", // Enforces "ADMIN" enum
          isActive: admin.isActive ?? true,
          tokenVersion: admin.tokenVersion ?? 0,
        });
        console.log(`✅ Created New Admin: ${admin.email}`);
      }
    }

    console.log(
      "\n🎉 All Admins Seeded Successfully according to User Schema!",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin Seeding Failed:", error.message);
    process.exit(1);
  }
};

seedAdmins();
