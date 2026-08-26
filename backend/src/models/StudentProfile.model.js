import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
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
      trim: true,
    },

    verifiedSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    /* skillBadges removed */

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

    completedProjectsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema,
);
