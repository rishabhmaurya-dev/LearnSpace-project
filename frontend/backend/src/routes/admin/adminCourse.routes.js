import express from "express";

import {
  createCourse,
  getAdminCourses,
  getCourseById,
  updateCourse,
  updateCapstone,
  deleteCourse,
  publishCourse,
  unpublishCourse,
} from "../../controllers/admin/adminCourseController.js";

import { uploadCourseImages } from "../../middlewares/upload.middleware.js";

import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

const adminOnly = [protect, authorize("ADMIN")];

/* ==============================
   COURSE
============================== */

router.post("/", ...adminOnly, uploadCourseImages, createCourse);

router.get("/", ...adminOnly, getAdminCourses);

router.get("/:courseId", ...adminOnly, getCourseById);

router.put("/:courseId", ...adminOnly, uploadCourseImages, updateCourse);

router.patch("/:courseId/capstone", ...adminOnly, updateCapstone);

router.delete("/:courseId", ...adminOnly, deleteCourse);

router.patch("/:courseId/publish", ...adminOnly, publishCourse);

router.patch("/:courseId/unpublish", ...adminOnly, unpublishCourse);

export default router;
