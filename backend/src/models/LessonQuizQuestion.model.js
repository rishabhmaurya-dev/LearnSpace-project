import mongoose from "mongoose";

const lessonQuizQuestionSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson ID is required"],
      index: true,
    },

    questionNumber: {
      type: Number,
      required: [true, "Question number is required"],
      min: [1, "Question number must start from 1"],
    },

    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },

    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: (value) => {
          return (
            value.length === 4 &&
            value.every(
              (option) =>
                typeof option === "string" && option.trim().length > 0,
            )
          );
        },
        message: "Exactly 4 non-empty options are required",
      },
    },

    correctOptionIndex: {
      type: Number,
      required: [true, "Correct option index is required"],
      min: [0, "Correct option index must be between 0 and 3"],
      max: [3, "Correct option index must be between 0 and 3"],
    },
  },
  {
    timestamps: true,
  },
);

export const LessonQuizQuestion = mongoose.model(
  "LessonQuizQuestion",
  lessonQuizQuestionSchema,
);
