import dotenv from "dotenv";
import path from "path";
// System root se .env load karein
dotenv.config({ path: path.join(process.cwd(), ".env") });

import mongoose from "mongoose";
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI .env file me missing h!");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ DB connected successfully");

  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
