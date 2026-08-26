import express from "express";

import {
  getAdminDashboardStats,
  getAdminPendingItems,
  getAdminLeaderboard,
  getCourseOverview,
  getAdminActivity,
} from "../../controllers/admin/adminDashboardController.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================================
// ADMIN ONLY
// ============================================================

router.use(protect);
router.use(authorize("ADMIN"));

// Main dashboard counters
router.get("/stats", getAdminDashboardStats);

// Pending company + capstone items
router.get("/pending", getAdminPendingItems);

// Recent activity feed
router.get("/activity", getAdminActivity);

// Leaderboard
router.get("/leaderboard", getAdminLeaderboard);

// Course overview
router.get("/courses", getCourseOverview);

export default router;
