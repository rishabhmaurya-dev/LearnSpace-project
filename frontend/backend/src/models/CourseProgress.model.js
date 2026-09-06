import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    quizScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    quizAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    isQuizPassed: {
      type: Boolean,
      default: false,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastAccessedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const courseProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },

    lastAccessedLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    lessonProgress: {
      type: [lessonProgressSchema],
      default: [],
    },

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // FINAL COURSE QUIZ
    quizScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    isQuizPassed: {
      type: Boolean,
      default: false,
    },

    finalQuizAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    isCapstoneUnlocked: {
      type: Boolean,
      default: false,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    courseCompletedAt: {
      type: Date,
      default: null,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

courseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

courseProgressSchema.index({ studentId: 1 });
courseProgressSchema.index({ courseId: 1 });

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema,
);
