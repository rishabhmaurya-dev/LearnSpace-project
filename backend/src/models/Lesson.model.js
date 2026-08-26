import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID reference is required"],
      index: true,
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
      maxlength: [200, "Lesson title cannot exceed 200 characters"],
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
      trim: true,
    },

    example: {
      type: String,
      required: [true, "Example is required"],
      trim: true,
    },

    codeExample: {
      type: String,
      default: "",
    },

    codeExampleExplanation: {
      type: String,
      default: "",
      trim: true,
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

    markdownSource: {
      type: String,
      default: "",
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Lesson = mongoose.model("Lesson", lessonSchema);
