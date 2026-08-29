import express from "express";

import {
  getCertificates,
  previewCertificate,
  sendCertificate,
  deleteCertificate,
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

// Cascade delete a certificate (resets capstone + cleans related data)
router.delete("/:certificateId", deleteCertificate);

export default router;
