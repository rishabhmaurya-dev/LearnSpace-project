import express from "express";

import {
  uploadLessonMarkdown,
  uploadLessonWithMcq,
  uploadMultipleLessonMarkdown,
  getCourseLessons,
  deleteLesson,
} from "../../controllers/admin/adminLessonController.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

import {
  uploadLessonMarkdown as uploadMarkdownFile,
  uploadLessonWithMcq as uploadLessonWithMcqFiles,
  uploadMultipleLessonMarkdown as uploadMultipleMarkdownFiles,
} from "../../middlewares/upload.middleware.js";

const router = express.Router();

const adminOnly = [protect, authorize("ADMIN")];

/* ==============================
   SINGLE LESSON
============================== */

router.post(
  "/course/:courseId/markdown",
  ...adminOnly,
  uploadMarkdownFile,
  uploadLessonMarkdown,
);

/* ==============================
   SINGLE LESSON + MCQ CSV (combined)
============================== */

router.post(
  "/course/:courseId/markdown-with-mcq",
  ...adminOnly,
  uploadLessonWithMcqFiles,
  uploadLessonWithMcq,
);

/* ==============================
   MULTIPLE LESSONS
============================== */

router.post(
  "/course/:courseId/markdown/bulk",
  ...adminOnly,
  uploadMultipleMarkdownFiles,
  uploadMultipleLessonMarkdown,
);

/* ==============================
   GET LESSONS
============================== */

router.get("/course/:courseId", ...adminOnly, getCourseLessons);

/* ==============================
   DELETE LESSON
============================== */

router.delete("/:lessonId", ...adminOnly, deleteLesson);

export default router;
