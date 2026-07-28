import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question string is required"],
  },
  options: {
    type: [String],
    validate: [
      (val) => val.length === 4,
      "Quiz question must have exactly 4 options",
    ],
  },
  correctOptionIndex: {
    type: Number,
    required: [true, "Correct option index (0-3) is required"],
    min: 0,
    max: 3,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required (e.g., React, Node.js)"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail URL is required"],
    },
    skillBadgeName: {
      type: String,
      required: [true, "Skill badge name is required"],
      trim: true,
    },
    skillBadgeIcon: {
      type: String,
      default: "",
    },

    // Embedded Course End Timed Quiz (10 to 100 MCQs)
    quiz: {
      type: [quizQuestionSchema],
      validate: [
        (val) => val.length >= 10 && val.length <= 100,
        "Course quiz must contain between 10 and 100 questions",
      ],
    },
    passingPercentage: {
      type: Number,
      default: 70,
      min: 1,
      max: 100,
    },
    quizTimeLimitMinutes: {
      type: Number,
      default: 45,
    },

    // Capstone Project Requirements
    capstoneProject: {
      title: {
        type: String,
        required: [true, "Capstone project title is required"],
        trim: true,
      },
      description: {
        type: String,
        required: [true, "Capstone project description is required"],
        trim: true,
      },
      submissionRequirements: {
        type: String,
        default: "Submit GitHub Repository URL & Live Demo Link",
      },
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", courseSchema);
