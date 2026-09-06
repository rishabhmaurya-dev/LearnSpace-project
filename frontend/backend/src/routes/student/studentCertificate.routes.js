import express from "express";

import {
  getMyCertificates,
  downloadCertificatePdf,
} from "../../controllers/student/studentCertificateController.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================================
// STUDENT ONLY
// ============================================================

router.use(protect);
router.use(authorize("STUDENT"));

// List my certificates (split into course + project columns)
router.get("/", getMyCertificates);

// Download a course-completion certificate as PDF
router.get("/:certificateId/pdf", downloadCertificatePdf);

export default router;
