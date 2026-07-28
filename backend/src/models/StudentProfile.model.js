import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    githubProfile: {
      type: String,
      default: "",
      trim: true,
    },
    linkedinProfile: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    verifiedSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    skillBadges: [
      {
        badgeName: { type: String, required: true },
        icon: { type: String, default: "" },
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    reputationPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedCoursesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

export const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema,
);
