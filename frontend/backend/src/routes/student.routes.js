import express from "express";

import {
  getMyStudentProfile,
  updateMyStudentProfile,
  getStudentDashboard,
  getPublishedCourses,
  enrollInCourse,
  getMyEnrolledCourses,
  getCourseLearningData,
  getLessonQuiz,
  submitLessonQuiz,
  getFinalQuiz,
  submitFinalQuiz,
  submitCapstone,
  getMyCapstoneSubmission,
} from "../controllers/studentController.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";
import { uploadStudentFiles } from "../middlewares/upload.middleware.js";

const router = express.Router();

const studentOnly = [protect, authorize("STUDENT")];

// ============================================================
// STUDENT PROFILE
// ============================================================

// Get my student profile
router.get("/profile/me", ...studentOnly, getMyStudentProfile);

// Update my student profile (multipart: avatar)
router.put(
  "/profile/me",
  ...studentOnly,
  uploadStudentFiles,
  updateMyStudentProfile,
);

// ============================================================
// DASHBOARD
// ============================================================

router.get("/dashboard", ...studentOnly, getStudentDashboard);

// ============================================================
// COURSES
// ============================================================

// Published course catalog (with enrollment status)
router.get("/courses", ...studentOnly, getPublishedCourses);

// My enrolled courses
router.get("/my/courses", ...studentOnly, getMyEnrolledCourses);

// Course learning data (lessons + progress + lock state)
router.get("/courses/:courseId/learn", ...studentOnly, getCourseLearningData);

// Enroll in a course
router.post("/courses/:courseId/enroll", ...studentOnly, enrollInCourse);

// Lesson quiz
router.get("/lessons/:lessonId/quiz", ...studentOnly, getLessonQuiz);
router.post("/lessons/:lessonId/quiz/submit", ...studentOnly, submitLessonQuiz);

// Final course quiz
router.get("/courses/:courseId/quiz", ...studentOnly, getFinalQuiz);
router.post("/courses/:courseId/quiz/submit", ...studentOnly, submitFinalQuiz);

// Capstone
router.get(
  "/courses/:courseId/capstone",
  ...studentOnly,
  getMyCapstoneSubmission,
);
router.post(
  "/courses/:courseId/capstone/submit",
  ...studentOnly,
  submitCapstone,
);

export default router;
