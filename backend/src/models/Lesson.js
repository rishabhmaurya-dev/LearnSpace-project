import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    lessonNumber: {
      type: Number,
      required: [true, "Lesson number is required"],
      min: [1, "Lesson number must be at least 1"],
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    notesPdfUrl: {
      type: String,
      trim: true,
    },
    concept: {
      type: String,
      trim: true,
    },
    codingQuestion: {
      problemStatement: { type: String, trim: true },
      starterCode: { type: String },
      expectedOutput: { type: String, trim: true },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Lesson", lessonSchema);
