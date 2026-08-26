import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true,
    },

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
      index: true,
    },

    quizType: {
      type: String,
      enum: {
        values: ["LESSON", "FINAL_COURSE"],
        message: "Invalid quiz type",
      },
      required: [true, "Quiz type is required"],
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    passingPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    passed: {
      type: Boolean,
      required: true,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    timeTakenSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

quizAttemptSchema.index({
  studentId: 1,
  courseId: 1,
  quizType: 1,
});

quizAttemptSchema.index({
  studentId: 1,
  lessonId: 1,
});

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
