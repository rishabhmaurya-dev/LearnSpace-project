import dotenv from "dotenv";
import mongoose from "mongoose";

import KnowledgeChunk from "../models/KnowledgeChunk.model.js";
import { loadMarkdown, chunkMarkdown } from "../utils/chunkMarkdown.js";
import { generateEmbedding } from "../utils/embedding.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

/**
 * Rebuild the LearnSpace knowledge base.
 *
 * Pipeline:
 *   loadMarkdown -> semantic chunks -> embeddings -> MongoDB Atlas.
 *
 * Safe re-indexing:
 *   - Only the KnowledgeChunk collection is touched. Users, courses,
 *     lessons, certificates, etc. are never deleted.
 *   - Records for the source "learnspace.md" are removed before re-insert,
 *     which prevents duplicates on every run.
 */
async function indexKnowledge() {
  try {
    console.log("📘 Markdown loaded");
    const markdown = loadMarkdown();

    console.log(`Characters: ${markdown.length}`);

    console.log("\n🧩 Semantic chunking...");
    const chunks = chunkMarkdown(markdown);

    const sizes = chunks.map((c) => c.content.length);
    const avgSize = chunks.length
      ? Math.round(sizes.reduce((a, b) => a + b, 0) / chunks.length)
      : 0;

    console.log(`Semantic chunks created: ${chunks.length}`);
    console.log(
      `Average chunk size: ${avgSize} chars (min: ${
        sizes.length ? Math.min(...sizes) : 0
      }, max: ${sizes.length ? Math.max(...sizes) : 0})`,
    );

    console.log("\n🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Only remove the existing knowledge for our source — prevents
    // duplicates while never touching unrelated application data.
    const removed = await KnowledgeChunk.deleteMany({
      source: "learnspace.md",
    });
    console.log(`🗑️ Removed ${removed.deletedCount} old knowledge records`);

    console.log("\n🧠 Generating embeddings...");
    let dimensions = 0;

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];

      process.stdout.write(`\r  ${i + 1}/${chunks.length}...`);

      // Embed the EXACT text that will be stored in `content`.
      const embedding = await generateEmbedding(chunk.content, "passage");

      if (dimensions === 0) dimensions = embedding.length;

      await KnowledgeChunk.create({
        content: chunk.content,
        source: "learnspace.md",
        section: chunk.section,
        chunkIndex: i,
        embedding,
      });
    }

    console.log(
      `\n\n✅ Embeddings generated: ${chunks.length}`,
    );
    console.log(`📐 Embedding dimensions: ${dimensions}`);

    console.log("💾 Stored in MongoDB Atlas");
    console.log("\n🎉 Knowledge base indexing completed");

    await mongoose.disconnect();
  } catch (error) {
    console.error("\n❌ Indexing failed:", error.response?.data || error.message);

    await mongoose.disconnect();
    process.exit(1);
  }
}

indexKnowledge();
