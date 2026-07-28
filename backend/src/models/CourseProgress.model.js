import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lastAccessedLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    quizScore: {
      type: Number,
      default: 0,
    },
    isQuizPassed: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

courseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema,
);
