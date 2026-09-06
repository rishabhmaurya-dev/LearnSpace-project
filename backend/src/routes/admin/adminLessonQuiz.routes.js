import express from "express";

import {
  uploadLessonMcqCsv,
  getLessonMcqs,
  deleteLessonMcqs,
} from "../../controllers/admin/adminLessonQuizController.js";

import { uploadCsv } from "../../middlewares/upload.middleware.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

const adminOnly = [protect, authorize("ADMIN")];

router.post(
  "/lesson/:lessonId/csv",
  ...adminOnly,
  uploadCsv,
  uploadLessonMcqCsv,
);

router.get("/lesson/:lessonId", ...adminOnly, getLessonMcqs);

router.delete("/lesson/:lessonId", ...adminOnly, deleteLessonMcqs);

export default router;
