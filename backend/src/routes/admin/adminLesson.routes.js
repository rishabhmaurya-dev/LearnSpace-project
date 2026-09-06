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

router.post(
  "/course/:courseId/markdown",
  ...adminOnly,
  uploadMarkdownFile,
  uploadLessonMarkdown,
);

router.post(
  "/course/:courseId/markdown-with-mcq",
  ...adminOnly,
  uploadLessonWithMcqFiles,
  uploadLessonWithMcq,
);

router.post(
  "/course/:courseId/markdown/bulk",
  ...adminOnly,
  uploadMultipleMarkdownFiles,
  uploadMultipleLessonMarkdown,
);

router.get("/course/:courseId", ...adminOnly, getCourseLessons);

router.delete("/:lessonId", ...adminOnly, deleteLesson);

export default router;
