import express from "express";

import {
  getStudents,
  getStudentDetails,
  updateStudentStatus,
  updateStudentReputation,
  getStudentLeaderboard,
  getStudentCourseProgress,
  getStudentQuizHistory,
} from "../../controllers/admin/adminStudentController.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN STUDENT MANAGEMENT
|--------------------------------------------------------------------------
*/

// Student master directory
router.get("/", protect, authorize("ADMIN"), getStudents);

// Student leaderboard
router.get("/leaderboard", protect, authorize("ADMIN"), getStudentLeaderboard);

// Detailed student profile + audit
router.get("/:studentId", protect, authorize("ADMIN"), getStudentDetails);

// Student account activate / block
router.patch(
  "/:studentId/status",
  protect,
  authorize("ADMIN"),
  updateStudentStatus,
);

// Reputation points adjustment
router.patch(
  "/:studentId/reputation",
  protect,
  authorize("ADMIN"),
  updateStudentReputation,
);

// Manual skill badge grant
// badge endpoints removed

// Course progress audit
router.get(
  "/:studentId/course-progress",
  protect,
  authorize("ADMIN"),
  getStudentCourseProgress,
);

// Quiz history audit
router.get(
  "/:studentId/quiz-history",
  protect,
  authorize("ADMIN"),
  getStudentQuizHistory,
);

export default router;
