import fs from "fs";
import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";

// =============================================================================
// 1. UPLOAD LESSON VIA JSON FILE (Admin Only - One JSON Per Lesson)
// =============================================================================
export const uploadLessonJsonFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a JSON file." });
    }

    const rawData = fs.readFileSync(req.file.path, "utf-8");
    const lessonData = JSON.parse(rawData);

    const {
      courseId,
      lessonNumber,
      heading,
      detailedMeaning,
      codeExample,
      codingQuestions,
      videoUrl,
      notesPdfUrl,
    } = lessonData;

    if (!courseId || !lessonNumber || !heading || !detailedMeaning) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message:
          "Invalid JSON. courseId, lessonNumber, heading, and detailedMeaning are required.",
      });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Associated course not found." });
    }

    const newLesson = await Lesson.create({
      course: courseId,
      lessonNumber: Number(lessonNumber),
      heading: heading.trim(),
      detailedMeaning: detailedMeaning.trim(),
      codeExample: codeExample || {},
      videoUrl: videoUrl || "",
      notesPdfUrl: notesPdfUrl || "",
      codingQuestions: codingQuestions || [],
    });

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.status(201).json({
      success: true,
      message: `Lesson ${newLesson.lessonNumber} uploaded successfully with ${newLesson.codingQuestions.length} coding questions!`,
      lesson: newLesson,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res
      .status(500)
      .json({ message: "Error uploading lesson JSON", error: error.message });
  }
};

// =============================================================================
// 2. CREATE LESSON MANUALLY (Form Data / API Payload)
// =============================================================================
export const createLesson = async (req, res) => {
  try {
    const {
      courseId,
      lessonNumber,
      heading,
      detailedMeaning,
      code,
      codeExplanation,
      codingQuestions,
    } = req.body;

    if (!courseId || !lessonNumber || !heading || !detailedMeaning) {
      return res.status(400).json({
        message:
          "Course ID, lesson number, heading, and detailed meaning are required.",
      });
    }

    const videoUrl = req.files?.videoFile?.[0]?.path || req.body.videoUrl || "";
    const notesPdfUrl =
      req.files?.notesPdfFile?.[0]?.path || req.body.notesPdfUrl || "";

    const lesson = await Lesson.create({
      course: courseId,
      lessonNumber: Number(lessonNumber),
      heading: heading.trim(),
      detailedMeaning: detailedMeaning.trim(),
      codeExample: {
        code: code || "",
        explanation: codeExplanation?.trim() || "",
      },
      videoUrl,
      notesPdfUrl,
      codingQuestions: codingQuestions || [],
    });

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully!",
      lesson,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating lesson", error: error.message });
  }
};

// =============================================================================
// 3. GET ALL LESSONS FOR A COURSE
// =============================================================================
export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort({
      lessonNumber: 1,
    });

    return res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching lessons", error: error.message });
  }
};

// =============================================================================
// 4. GET SINGLE LESSON BY ID
// =============================================================================
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate(
      "course",
      "title skillBadge",
    );
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    return res.status(200).json({ success: true, lesson });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching lesson", error: error.message });
  }
};
