import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Course thumbnail URL is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    skillBadge: {
      type: String,
      required: [true, "Skill badge name is required"],
      trim: true,
    },
    capstoneProjectTitle: {
      type: String,
      required: [true, "Capstone project title is required"],
      trim: true,
    },
    capstoneProjectDescription: {
      type: String,
      required: [true, "Capstone project description is required"],
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
