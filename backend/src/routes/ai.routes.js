import express from "express";

import { chatWithStudentAI } from "../controllers/ai.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Student-only AI chat endpoint.
// protect: verifies JWT, attaches req.user (full User document)
// authorize("STUDENT"): ensures role === "STUDENT", returns 403 otherwise
router.post("/chat", protect, authorize("STUDENT"), chatWithStudentAI);

export default router;
