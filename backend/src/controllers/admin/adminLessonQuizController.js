import mongoose from "mongoose";
import { Course } from "../../models/Course.model.js";
import { Lesson } from "../../models/Lesson.model.js";
import { LessonQuizQuestion } from "../../models/LessonQuizQuestion.model.js";
import { parse } from "csv-parse/sync";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/* =========================================================
   UPLOAD LESSON MCQs CSV
   STEP 3
========================================================= */

export const uploadLessonMcqCsv = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const course = await Course.findById(lesson.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Published course cannot be modified",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const csvText = req.file.buffer.toString("utf-8");

    let records;

    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid CSV file",
        error: error.message,
      });
    }

    if (!records.length) {
      return res.status(400).json({
        success: false,
        message: "CSV file contains no questions",
      });
    }

    const questions = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];

      const question = row.question?.trim();

      const optionA = row.optionA?.trim();

      const optionB = row.optionB?.trim();

      const optionC = row.optionC?.trim();

      const optionD = row.optionD?.trim();

      const correctOptionIndex = Number(row.correctOptionIndex);

      const rowNumber = i + 2;

      if (!question) {
        return res.status(400).json({
          success: false,
          message: `Question missing at CSV row ${rowNumber}`,
        });
      }

      if (!optionA || !optionB || !optionC || !optionD) {
        return res.status(400).json({
          success: false,
          message: `Exactly 4 options are required at row ${rowNumber}`,
        });
      }

      if (
        !Number.isInteger(correctOptionIndex) ||
        correctOptionIndex < 0 ||
        correctOptionIndex > 3
      ) {
        return res.status(400).json({
          success: false,
          message: `correctOptionIndex must be 0, 1, 2 or 3 at row ${rowNumber}`,
        });
      }

      questions.push({
        lessonId: lesson._id,

        questionNumber: i + 1,

        question,

        options: [optionA, optionB, optionC, optionD],

        correctOptionIndex,
      });
    }

    /* --------------------------------
       Replace old questions
    -------------------------------- */

    await LessonQuizQuestion.deleteMany({
      lessonId: lesson._id,
    });

    const inserted = await LessonQuizQuestion.insertMany(questions);

    return res.status(201).json({
      success: true,
      message: `${inserted.length} lesson MCQs uploaded successfully`,
      count: inserted.length,
      questions: inserted,
    });
  } catch (error) {
    console.error("uploadLessonMcqCsv:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while uploading lesson MCQs",
      error: error.message,
    });
  }
};

/* =========================================================
   GET LESSON MCQs
========================================================= */

export const getLessonMcqs = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const questions = await LessonQuizQuestion.find({
      lessonId,
    })
      .sort({
        questionNumber: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      lesson,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("getLessonMcqs:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching lesson MCQs",
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE ALL LESSON MCQs
========================================================= */

export const deleteLessonMcqs = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const course = await Course.findById(lesson.courseId);

    if (course?.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Published course MCQs cannot be deleted",
      });
    }

    const result = await LessonQuizQuestion.deleteMany({
      lessonId,
    });

    return res.status(200).json({
      success: true,
      message: "Lesson MCQs deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("deleteLessonMcqs:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting MCQs",
      error: error.message,
    });
  }
};

// (question, optionA, optionB, optionC, optionD, correctOptionIndex);
// ("What is React?", "Library", "Database", "OS", "Language", 0);
// ("What is JSX?", "Syntax", "Database", "Server", "Compiler", 0);
// ("Which hook manages state?",
//   "useState",
//   "useEffect",
//   "useMemo",
//   "useCallback",
//   0);
