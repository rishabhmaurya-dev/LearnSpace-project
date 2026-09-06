import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Quiz question is required"],
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (val) =>
          Array.isArray(val) &&
          val.length === 4 &&
          val.every((option) => option?.trim()),
        message: "Quiz question must have exactly 4 non-empty options",
      },
    },

    correctOptionIndex: {
      type: Number,
      required: [true, "Correct option index is required"],
      min: 0,
      max: 3,
    },
  },
  { _id: true },
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      unique: true,
      minlength: [3, "Course title must be at least 3 characters"],
      maxlength: [150, "Course title cannot exceed 150 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail image is required"],
      trim: true,
    },

    // Final course quiz
    quiz: {
      type: [quizQuestionSchema],
      default: [],
      validate: {
        validator: (val) => val.length <= 50,
        message: "Course final quiz cannot contain more than 50 questions",
      },
    },

    passingPercentage: {
      type: Number,
      default: 70,
      min: [1, "Passing percentage must be at least 1"],
      max: [100, "Passing percentage cannot exceed 100"],
    },

    quizTimeLimitMinutes: {
      type: Number,
      default: 45,
      min: [1, "Quiz time must be at least 1 minute"],
    },

    // Lesson MCQ pass percentage
    lessonQuizPassingPercentage: {
      type: Number,
      default: 70,
      min: 1,
      max: 100,
    },

    capstoneProject: {
      title: {
        type: String,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },

      submissionRequirements: {
        type: String,
        default: "Submit GitHub Repository URL & Live Demo Link",
        trim: true,
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course creator is required"],
      immutable: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Course = mongoose.model("Course", courseSchema);
