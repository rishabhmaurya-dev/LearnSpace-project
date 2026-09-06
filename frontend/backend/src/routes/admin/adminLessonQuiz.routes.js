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

/* ==============================
   UPLOAD CSV
============================== */

router.post(
  "/lesson/:lessonId/csv",
  ...adminOnly,
  uploadCsv,
  uploadLessonMcqCsv,
);

/* ==============================
   GET MCQs
============================== */

router.get("/lesson/:lessonId", ...adminOnly, getLessonMcqs);

/* ==============================
   DELETE MCQs
============================== */

router.delete("/lesson/:lessonId", ...adminOnly, deleteLessonMcqs);

export default router;
