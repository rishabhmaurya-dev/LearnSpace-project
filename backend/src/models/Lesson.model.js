import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID reference is required"],
    },
    lessonNumber: {
      type: Number,
      required: [true, "Lesson number is required"],
      min: [1, "Lesson number must start from 1"],
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    topicHeading: {
      type: String,
      required: [true, "Topic heading is required"],
      trim: true,
    },
    definition: {
      type: String,
      required: [true, "Definition is required"],
      trim: true,
    },
    detailedMeaning: {
      type: String,
      required: [true, "Detailed explanation is required"],
    },
    codeExample: {
      type: String,
      required: [true, "Code example is required"],
    },
    codeExampleExplanation: {
      type: String,
      required: [true, "Code example explanation is required"],
    },
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    notesPdfUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

lessonSchema.index({ courseId: 1, lessonNumber: 1 }, { unique: true });

export const Lesson = mongoose.model("Lesson", lessonSchema);
