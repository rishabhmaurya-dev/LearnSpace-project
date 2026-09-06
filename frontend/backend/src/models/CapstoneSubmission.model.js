import mongoose from "mongoose";

const capstoneSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true,
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
      enum: {
        values: ["PENDING", "APPROVED", "REJECTED"],
        message: "Invalid capstone status",
      },
      default: "PENDING",
      index: true,
    },

    adminFeedback: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    submissionVersion: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Tracks whether a course-completion certificate has already been issued
    // for this approved capstone (prevents duplicate certificates).
    certificateIssued: {
      type: Boolean,
      default: false,
    },

    certificateIssuedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

capstoneSubmissionSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const CapstoneSubmission = mongoose.model(
  "CapstoneSubmission",
  capstoneSubmissionSchema,
);
