import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import {
  getAdminDashboardStats,
  getAllCompanies,
  verifyCompany,
  getAllCapstones,
  reviewCapstoneSubmission,
  getAllAdminCourses,
  updateCourse,
  deleteCourse,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Enforce authentication & ADMIN role guard on all routes
router.use(protect);
router.use(authorize("ADMIN"));

// 📊 1. Sidebar Item 1: Dashboard Stats
router.get("/dashboard-stats", getAdminDashboardStats);

// 🏢 2. Sidebar Item 2: Company Verification & Management
router.get("/companies", getAllCompanies);
router.patch("/companies/:companyProfileId/verify", verifyCompany);

// 🎓 3. Sidebar Item 3: Capstone Review & Badge Issuance
router.get("/capstones", getAllCapstones);
router.patch("/capstones/:submissionId/review", reviewCapstoneSubmission);

// 📚 4. Sidebar Item 4: Course Management (Edit/Delete)
router.get("/courses", getAllAdminCourses);
router.put("/courses/:courseId", updateCourse);
router.delete("/courses/:courseId", deleteCourse);

// 👤 5. Sidebar Item 5: Profile Settings
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);

export default router;
