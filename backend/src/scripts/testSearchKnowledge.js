import dotenv from "dotenv";
import mongoose from "mongoose";

import { searchKnowledge } from "../utils/searchKnowledge.js";

dotenv.config();

async function testSearch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    const query = "How can a student get a certificate in LearnSpace?";

    const results = await searchKnowledge(query, 3);

    console.log(`\n🔎 Query: ${query}`);
    console.log(`📚 Results: ${results.length}`);

    results.forEach((result, index) => {
      console.log(`\n--- RESULT ${index + 1} ---`);
      console.log("Section:", result.section);
      console.log("Score:", result.score);
      console.log("Chunk:", result.chunkIndex);
      console.log("Content:");
      console.log(result.content.slice(0, 500));
    });
  } catch (error) {
    console.error("❌ Search failed:", error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testSearch();
