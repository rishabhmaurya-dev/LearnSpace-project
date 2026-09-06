import { loadMarkdown, chunkMarkdown } from "../utils/chunkMarkdown.js";

const markdown = loadMarkdown();

const chunks = chunkMarkdown(markdown);

console.log("📘 Markdown loaded");
console.log("Total characters:", markdown.length);
console.log("Total chunks:", chunks.length);

const sizes = chunks.map((c) => c.content.length);
console.log(
  "Avg chunk size:",
  Math.round(sizes.reduce((a, b) => a + b, 0) / chunks.length),
  "chars",
);

chunks.slice(0, 5).forEach((chunk, index) => {
  console.log(`\n--- CHUNK ${index + 1} (section: ${chunk.section}) ---`);
  console.log(chunk.content.slice(0, 300));
});
