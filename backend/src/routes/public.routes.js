import express from "express";

import { getPublicCourses } from "../controllers/publicController.js";

const router = express.Router();

// public course catalogue (landing page) — no auth required
router.get("/courses", getPublicCourses);

export default router;
