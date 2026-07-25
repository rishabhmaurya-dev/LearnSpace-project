import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    githubProfile: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
        "Please enter a valid GitHub profile URL",
      ],
    },
    // 1. Student khud profile setup ke waqt enter karega (Self-Reported)
    selfDeclaredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    // 2. Course & Timed Quiz clear hone par Backend Auto-Add karega (Verified)
    verifiedSkillBadges: [
      {
        badgeName: { type: String, required: true }, // e.g. "React.js Master"
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        score: { type: Number }, // e.g. 88 (%)
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    completedProjectCount: {
      type: Number,
      default: 0,
      min: [0, "Project count cannot be negative"],
    },
    reputationPoints: {
      type: Number,
      default: 0,
      min: [0, "Reputation points cannot be negative"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("StudentProfile", studentProfileSchema);
