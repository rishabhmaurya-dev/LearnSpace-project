import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        return v.length >= 2;
      },
      message: "At least 2 options are required",
    },
  },
  correctOptionIndex: {
    type: Number,
    required: [true, "Correct option index is required"],
    min: [0, "Index cannot be negative"],
  },
});

const courseQuizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
      unique: true,
    },
    timeLimitMinutes: {
      type: Number,
      required: [true, "Time limit in minutes is required"],
      min: [1, "Time limit must be at least 1 minute"],
    },
    passingPercentage: {
      type: Number,
      default: 70,
      min: [1, "Passing percentage cannot be less than 1"],
      max: [100, "Passing percentage cannot exceed 100"],
    },
    questions: [questionSchema],
  },
  { timestamps: true },
);

export default mongoose.model("CourseQuiz", courseQuizSchema);
