import mongoose from "mongoose";

const companyProjectSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Company reference is required"],
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    difficulty: {
      type: String,
      enum: {
        values: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
        message: "{VALUE} is not a valid difficulty level",
      },
      default: "INTERMEDIATE",
    },
    deadlineDays: {
      type: Number,
      required: [true, "Deadline duration in days is required"],
      min: [1, "Deadline must be at least 1 day"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CompanyProject", companyProjectSchema);
