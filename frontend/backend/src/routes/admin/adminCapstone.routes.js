import express from "express";

import {
  getCapstoneSubmissions,
  getPendingCapstones,
  getCapstoneDetails,
  approveCapstone,
  rejectCapstone,
  getCapstoneStats,
} from "../../controllers/admin/adminCapstoneController.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================================
// ADMIN ONLY
// ============================================================

router.use(protect);
router.use(authorize("ADMIN"));

// Statistics
router.get("/stats", getCapstoneStats);

// Pending review queue
router.get("/pending", getPendingCapstones);

// All submissions
router.get("/", getCapstoneSubmissions);

// Single submission
router.get("/:submissionId", getCapstoneDetails);

// Approve
router.patch("/:submissionId/approve", approveCapstone);

// Reject
router.patch("/:submissionId/reject", rejectCapstone);

export default router;
