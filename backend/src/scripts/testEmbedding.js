import dotenv from "dotenv";
import { generateEmbedding } from "../utils/embedding.js";

dotenv.config();

const text = "How can a student get a certificate in LearnSpace?";

try {
  const embedding = await generateEmbedding(text, "query");

  console.log("✅ Embedding generated successfully");
  console.log("Dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
} catch (error) {
  console.error("❌ Embedding failed:", error.response?.data || error.message);
}
