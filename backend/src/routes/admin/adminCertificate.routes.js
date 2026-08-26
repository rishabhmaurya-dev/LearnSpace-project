import express from "express";

import {
  getCertificates,
  previewCertificate,
  sendCertificate,
} from "../../controllers/admin/adminCertificateController.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================================
// ADMIN ONLY
// ============================================================

router.use(protect);
router.use(authorize("ADMIN"));

// List all issued certificates
router.get("/", getCertificates);

// Build a certificate preview for an approved capstone (no persistence)
router.post("/preview", previewCertificate);

// Generate + persist + send a certificate
router.post("/send", sendCertificate);

export default router;
