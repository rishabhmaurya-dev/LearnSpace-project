import mongoose from "mongoose";

const projectEnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProject",
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    deadlineDate: {
      type: Date,
      required: true,
    },
    githubRepoUrl: {
      type: String,
      trim: true,
    },
    liveDemoUrl: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["ENROLLED", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"],
        message: "{VALUE} is not a valid enrollment status",
      },
      default: "ENROLLED",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    companyFeedback: {
      type: String,
      trim: true,
    },
    companyCertificateUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

projectEnrollmentSchema.index({ student: 1, project: 1 }, { unique: true });

export default mongoose.model("ProjectEnrollment", projectEnrollmentSchema);
