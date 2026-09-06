import mongoose from "mongoose";

const knowledgeChunkSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      default: "",
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
