import mongoose from "mongoose";

const companyProjectSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description (Markdown) is required"],
    },
    requiredSkills: {
      type: [String],
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
    },
    deadlineInDays: {
      type: Number,
      required: [true, "Deadline duration in days is required"],
      min: 1,
    },
    reputationPointsReward: {
      type: Number,
      default: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const CompanyProject = mongoose.model(
  "CompanyProject",
  companyProjectSchema,
);
