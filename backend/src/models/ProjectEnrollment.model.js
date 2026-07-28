import mongoose from "mongoose";

const projectEnrollmentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProject",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    // Auto-calculated: enrolledAt + deadlineInDays
    submissionDeadline: {
      type: Date,
      required: true,
    },
    githubRepoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    submittedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED", "EXPIRED"],
      default: "IN_PROGRESS",
    },
    companyRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    companyFeedback: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

projectEnrollmentSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

export const ProjectEnrollment = mongoose.model(
  "ProjectEnrollment",
  projectEnrollmentSchema,
);
