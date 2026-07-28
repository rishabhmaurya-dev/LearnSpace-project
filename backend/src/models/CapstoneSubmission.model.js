import mongoose from "mongoose";

const capstoneSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    githubRepoUrl: {
      type: String,
      required: [true, "GitHub repository link is required"],
      trim: true,
    },
    liveDemoUrl: {
      type: String,
      required: [true, "Live demo link is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    adminFeedback: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const CapstoneSubmission = mongoose.model(
  "CapstoneSubmission",
  capstoneSubmissionSchema,
);
