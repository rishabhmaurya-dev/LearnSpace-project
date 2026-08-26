import express from "express";

import { uploadFinalQuizCsv } from "../../controllers/admin/adminCourseQuizController.js";

import { uploadCsv } from "../../middlewares/upload.middleware.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/course/:courseId/final-quiz/csv",
  protect,
  authorize("ADMIN"),
  uploadCsv,
  uploadFinalQuizCsv,
);

export default router;
