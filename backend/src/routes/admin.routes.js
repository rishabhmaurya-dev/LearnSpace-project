import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getPendingCompanies,
  verifyCompany,
  getAdminDashboardStats,
} from "../controllers/adminController.js";

const router = express.Router();

// All routes are strictly protected for ADMIN role only
router.use(protect, authorize("ADMIN"));

// Company Moderation
router.get("/pending-companies", getPendingCompanies);
router.patch("/verify-company/:profileId", verifyCompany);

// Analytics
router.get("/dashboard-stats", getAdminDashboardStats);

export default router;