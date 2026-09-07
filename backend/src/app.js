import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";

import fs from "fs";

import adminCourseRoutes from "./routes/admin/adminCourse.routes.js";
import adminLessonRoutes from "./routes/admin/adminLesson.routes.js";
import adminLessonQuizRoutes from "./routes/admin/adminLessonQuiz.routes.js";
import adminCourseQuizRoutes from "./routes/admin/adminCourseQuiz.routes.js";

import aiRoutes from "./routes/ai.routes.js";

import adminStudentRoutes from "./routes/admin/adminStudent.routes.js";

import adminCapstoneRoutes from "./routes/admin/adminCapstone.routes.js";

import adminDashboardRoutes from "./routes/admin/adminDashboard.routes.js";

import adminCertificateRoutes from "./routes/admin/adminCertificate.routes.js";

import studentCertificateRoutes from "./routes/student/studentCertificate.routes.js";

import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://learnspace-kappa.vercel.app",
];

if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Serve generated certificate PDFs (and other uploads) statically.
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/files/download", (req, res) => {
  const filePath = path.resolve(__dirname, "../uploads/notes/proj.pdf");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: "PDF not found",
    });
  }
  res.download(filePath, "react-components-notes.pdf");
});

app.use("/api/auth", authRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/student", studentRoutes);

app.use("/api/admin/courses", adminCourseRoutes);
app.use("/api/admin/lessons", adminLessonRoutes);
app.use("/api/admin/lesson-quizzes", adminLessonQuizRoutes);
app.use("/api/admin/course-quizzes", adminCourseQuizRoutes);

app.use("/api/admin/students", adminStudentRoutes);

app.use("/api/admin/capstones", adminCapstoneRoutes);

app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use("/api/admin/certificates", adminCertificateRoutes);

// ============================================================
// STUDENT CERTIFICATES
// ============================================================

app.use("/api/student/certificates", studentCertificateRoutes);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
