import mongoose from "mongoose";
import { Course } from "../../models/Course.model.js";
import { Lesson } from "../../models/Lesson.model.js";
import { LessonQuizQuestion } from "../../models/LessonQuizQuestion.model.js";
import { parseLessonMarkdown } from "../../utils/parseMarkdown.js";
import { parse } from "csv-parse/sync";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/* =========================================================
   HELPERS
========================================================= */

const parseLessonMcqCsv = (csvText) => {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  if (!records.length) {
    throw new Error("CSV file contains no questions");
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
      throw new Error(`Question missing at CSV row ${rowNumber}`);
    }

    if (!optionA || !optionB || !optionC || !optionD) {
      throw new Error(`Exactly 4 options are required at row ${rowNumber}`);
    }

    if (
      !Number.isInteger(correctOptionIndex) ||
      correctOptionIndex < 0 ||
      correctOptionIndex > 3
    ) {
      throw new Error(
        `correctOptionIndex must be 0, 1, 2 or 3 at row ${rowNumber}`,
      );
    }

    questions.push({
      questionNumber: i + 1,
      question,
      options: [optionA, optionB, optionC, optionD],
      correctOptionIndex,
    });
  }

  return questions;
};

/* =========================================================
   UPLOAD LESSON MARKDOWN
   STEP 2
========================================================= */

export const uploadLessonMarkdown = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

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

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Markdown file is required",
      });
    }

    const markdown = file.buffer.toString("utf-8");

    const lessonData = parseLessonMarkdown(markdown);

    const lastLesson = await Lesson.findOne({
      courseId,
    }).sort({
      lessonNumber: -1,
    });

    const lessonNumber = lastLesson ? lastLesson.lessonNumber + 1 : 1;

    const existingLesson = await Lesson.findOne({
      courseId,
      title: lessonData.title,
    });

    if (existingLesson) {
      return res.status(409).json({
        success: false,
        message: "A lesson with this title already exists",
      });
    }

    const lesson = await Lesson.create({
      courseId,

      lessonNumber,

      ...lessonData,

      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "Lesson markdown uploaded successfully",
      lesson,
    });
  } catch (error) {
    console.error("uploadLessonMarkdown:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to process markdown file",
    });
  }
};

/* =========================================================
   UPLOAD LESSON MARKDOWN + MCQ CSV (combined)
   STEP 2 — single request creates lesson AND its MCQs
========================================================= */

export const uploadLessonWithMcq = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

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

    const markdownFile = req.files?.lessonFile?.[0];

    const mcqCsvFile = req.files?.lessonMcqCsv?.[0];

    if (!markdownFile) {
      return res.status(400).json({
        success: false,
        message: "Markdown file is required",
      });
    }

    const markdown = markdownFile.buffer.toString("utf-8");

    const lessonData = parseLessonMarkdown(markdown);

    const lastLesson = await Lesson.findOne({
      courseId,
    }).sort({
      lessonNumber: -1,
    });

    const lessonNumber = lastLesson ? lastLesson.lessonNumber + 1 : 1;

    const existingLesson = await Lesson.findOne({
      courseId,
      title: lessonData.title,
    });

    if (existingLesson) {
      return res.status(409).json({
        success: false,
        message: "A lesson with this title already exists",
      });
    }

    const lesson = await Lesson.create({
      courseId,
      lessonNumber,
      ...lessonData,
      isPublished: false,
    });

    let mcqCount = 0;

    let questions = [];

    if (mcqCsvFile) {
      try {
        const csvText = mcqCsvFile.buffer.toString("utf-8");

        questions = parseLessonMcqCsv(csvText).map((q) => ({
          ...q,
          lessonId: lesson._id,
        }));

        await LessonQuizQuestion.deleteMany({
          lessonId: lesson._id,
        });

        const inserted = await LessonQuizQuestion.insertMany(questions);

        mcqCount = inserted.length;
      } catch (csvError) {
        // If CSV is invalid, roll back the created lesson to keep data consistent.
        await Lesson.findByIdAndDelete(lesson._id);

        return res.status(400).json({
          success: false,
          message: csvError.message || "Failed to parse lesson MCQ CSV",
        });
      }
    }

    return res.status(201).json({
      success: true,
      message:
        mcqCount > 0
          ? `Lesson and ${mcqCount} MCQs uploaded successfully`
          : "Lesson markdown uploaded successfully",
      lesson,
      mcqCount,
    });
  } catch (error) {
    console.error("uploadLessonWithMcq:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to process lesson upload",
    });
  }
};

/* =========================================================
   UPLOAD MULTIPLE MARKDOWN FILES
========================================================= */

export const uploadMultipleLessonMarkdown = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one markdown file is required",
      });
    }

    let lastLesson = await Lesson.findOne({
      courseId,
    }).sort({
      lessonNumber: -1,
    });

    let nextLessonNumber = lastLesson ? lastLesson.lessonNumber + 1 : 1;

    const createdLessons = [];

    for (const file of req.files) {
      const markdown = file.buffer.toString("utf-8");

      const lessonData = parseLessonMarkdown(markdown);

      const duplicate = await Lesson.findOne({
        courseId,
        title: lessonData.title,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Lesson '${lessonData.title}' already exists`,
        });
      }

      const lesson = await Lesson.create({
        courseId,

        lessonNumber: nextLessonNumber,

        ...lessonData,

        isPublished: false,
      });

      createdLessons.push(lesson);

      nextLessonNumber++;
    }

    return res.status(201).json({
      success: true,
      message: `${createdLessons.length} lessons uploaded successfully`,
      lessons: createdLessons,
    });
  } catch (error) {
    console.error("uploadMultipleLessonMarkdown:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   GET COURSE LESSONS
========================================================= */

export const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const lessons = await Lesson.find({
      courseId,
    })
      .sort({
        lessonNumber: 1,
      })
      .lean();

    const lessonIds = lessons.map((lesson) => lesson._id);

    const counts = await LessonQuizQuestion.aggregate([
      {
        $match: {
          lessonId: {
            $in: lessonIds,
          },
        },
      },
      {
        $group: {
          _id: "$lessonId",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const countMap = new Map(
      counts.map((item) => [item._id.toString(), item.count]),
    );

    const result = lessons.map((lesson) => ({
      ...lesson,

      mcqCount: countMap.get(lesson._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      lessons: result,
    });
  } catch (error) {
    console.error("getCourseLessons:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching lessons",
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE LESSON
========================================================= */

export const deleteLesson = async (req, res) => {
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
        message: "Lesson cannot be deleted from published course",
      });
    }

    await LessonQuizQuestion.deleteMany({
      lessonId,
    });

    await Lesson.findByIdAndDelete(lessonId);

    return res.status(200).json({
      success: true,
      message: "Lesson and related MCQs deleted successfully",
    });
  } catch (error) {
    console.error("deleteLesson:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting lesson",
      error: error.message,
    });
  }
};
