import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    currentLessonNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    capstoneSubmitted: {
      type: Boolean,
      default: false,
    },
    quizCleared: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("UserProgress", userProgressSchema);
