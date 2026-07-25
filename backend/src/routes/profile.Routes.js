import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import {
  getMyProfile,
  changePassword,
  updateAdminProfile,
  createStudentProfile,
  updateStudentProfile,
  createCompanyProfile,
  updateCompanyProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// -----------------------------------------------------------------------------
// COMMON ROUTES (All Roles)
// -----------------------------------------------------------------------------
router.get("/me", protect, getMyProfile);
router.patch("/change-password", protect, changePassword);

// -----------------------------------------------------------------------------
// ADMIN ROUTES
// -----------------------------------------------------------------------------
router.put(
  "/admin",
  protect,
  authorize("ADMIN"),
  upload.single("profilePhotoFile"),
  updateAdminProfile,
);

// -----------------------------------------------------------------------------
// STUDENT ROUTES (POST for Create, PUT for Update)
// -----------------------------------------------------------------------------
router.post(
  "/student",
  protect,
  authorize("STUDENT"),
  upload.single("profilePhotoFile"),
  createStudentProfile,
);

router.put(
  "/student",
  protect,
  authorize("STUDENT"),
  upload.single("profilePhotoFile"),
  updateStudentProfile,
);

// -----------------------------------------------------------------------------
// COMPANY ROUTES (POST for Create, PUT for Update)
// -----------------------------------------------------------------------------
router.post(
  "/company",
  protect,
  authorize("COMPANY"),
  upload.fields([
    { name: "logoFile", maxCount: 1 },
    { name: "documentFile", maxCount: 1 },
  ]),
  createCompanyProfile,
);

router.put(
  "/company",
  protect,
  authorize("COMPANY"),
  upload.fields([
    { name: "logoFile", maxCount: 1 },
    { name: "documentFile", maxCount: 1 },
  ]),
  updateCompanyProfile,
);

export default router;
