import KnowledgeChunk from "../models/KnowledgeChunk.model.js";
import { generateEmbedding } from "./embedding.js";

const VECTOR_INDEX_NAME = "default";

/**
 * Retrieve the most relevant knowledge chunks for a user query.
 *
 * Pipeline:
 *   user question -> embedding -> MongoDB Atlas vector search -> top chunks
 *
 * Returns { content, section, chunkIndex, source, score } for each hit.
 */
export async function searchKnowledge(query, limit = 3) {
  const queryEmbedding = await generateEmbedding(query, "query");

  const results = await KnowledgeChunk.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit,
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        section: 1,
        chunkIndex: 1,
        source: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return results;
}
