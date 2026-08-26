import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Certificate } from "../../models/Certificate.model.js";
import { CapstoneSubmission } from "../../models/CapstoneSubmission.model.js";
import { Course } from "../../models/Course.model.js";
import { User } from "../../models/User.model.js";
import { CourseProgress } from "../../models/CourseProgress.model.js";

import {
  generateCertificatePdf,
  buildCertificatePreviewData,
  PLATFORM_BRAND,
} from "../../utils/certificateGenerator.js";
import { StudentProfile } from "../../models/StudentProfile.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder where generated certificate PDFs will be stored.
const CERT_STORAGE_DIR = path.resolve(
  __dirname,
  "../../../uploads/certificates",
);

/**
 * Generate a unique, human-friendly certificate code.
 * Format: SBF-<YEAR>-<BASE32 random>
 */
function makeCertificateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 8; i += 1) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SBF-${new Date().getFullYear()}-${rand}`;
}

/**
 * Format a Date as a human readable string, e.g. "05 Jan 2025".
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Load the dynamic data needed to build a certificate for an approved capstone.
 * Returns null if the capstone is not approved or a required ref is missing.
 */
async function loadCapstoneContext(capstoneId) {
  const capstone = await CapstoneSubmission.findOne({
    _id: capstoneId,
    status: "APPROVED",
  });

  if (!capstone) return null;

  const [student, course] = await Promise.all([
    User.findById(capstone.studentId).lean(),
    Course.findById(capstone.courseId).lean(),
  ]);

  if (!student || !course) return null;

  // Grab the final quiz score for the "score" metadata (optional).
  const progress = await CourseProgress.findOne({
    studentId: capstone.studentId,
    courseId: capstone.courseId,
  }).lean();

  return {
    capstone,
    student,
    course,
    score: progress?.isQuizPassed ? progress.quizScore : null,
  };
}

/**
 * GET /api/admin/certificates
 * List all issued certificates (newest first).
 */
export async function getCertificates(req, res) {
  try {
    const { type } = req.query;

    const filter = {};
    if (type === "COURSE" || type === "course") {
      filter.certificateType = "COURSE_COMPLETION";
    }

    const certificates = await Certificate.find(filter)
      .sort({ issueDate: -1, createdAt: -1 })
      .populate("courseId", "title category")
      .populate("issuedBy", "name email")
      .lean();

    res.status(200).json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/certificates/preview
 * Body: { capstoneSubmissionId }
 * Builds and returns the certificate preview payload WITHOUT persisting anything.
 */
export async function previewCertificate(req, res) {
  try {
    const { capstoneSubmissionId } = req.body;

    if (!mongoose.isValidObjectId(capstoneSubmissionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid capstone submission id" });
    }

    const ctx = await loadCapstoneContext(capstoneSubmissionId);
    if (!ctx) {
      return res.status(404).json({
        success: false,
        message: "Approved capstone submission not found",
      });
    }

    const { capstone, student, course, score } = ctx;

    const studentName = student.name || "Student";
    const courseTitle = course.title;
    const courseDescription = course.description || "";
    const certificateCode = makeCertificateCode();
    const issueDate = formatDate(new Date());

    const preview = buildCertificatePreviewData({
      studentName,
      courseTitle,
      courseDescription,
      certificateCode,
      issueDate,
      score: score != null ? `${score}%` : "",
    });

    res.status(200).json({
      success: true,
      preview: {
        ...preview,
        capstoneSubmissionId: capstone._id,
        studentEmail: student.email || "",
        issuedBy: PLATFORM_BRAND.name,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/certificates/send
 * Body: { capstoneSubmissionId }
 * Generates the PDF, persists a Certificate and marks the capstone as issued.
 */
export async function sendCertificate(req, res) {
  try {
    const { capstoneSubmissionId } = req.body;

    if (!mongoose.isValidObjectId(capstoneSubmissionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid capstone submission id" });
    }

    const ctx = await loadCapstoneContext(capstoneSubmissionId);
    if (!ctx) {
      return res.status(404).json({
        success: false,
        message: "Approved capstone submission not found",
      });
    }

    const { capstone, student, course, score } = ctx;

    // Prevent duplicate certificate issue for the same capstone.
    if (capstone.certificateIssued) {
      return res.status(409).json({
        success: false,
        message: "A certificate has already been issued for this capstone",
      });
    }

    const studentName = student.name || "Student";
    const courseTitle = course.title;
    const courseDescription = course.description || "";
    const certificateCode = makeCertificateCode();
    const issueDate = formatDate(new Date());

    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/student/certificates`;

    const preview = buildCertificatePreviewData({
      studentName,
      courseTitle,
      courseDescription,
      certificateCode,
      issueDate,
      score: score != null ? `${score}%` : "",
    });

    // Generate the PDF buffer.
    const pdfBuffer = await generateCertificatePdf({
      studentName,
      courseTitle,
      courseDescription,
      certificateCode,
      issueDate,
      aboutWebsite: preview.aboutWebsite,
      completionSentence: preview.completionSentence,
      appreciationSentence: preview.appreciationSentence,
      companyName: PLATFORM_BRAND.name,
      verificationUrl,
      score: preview.score,
    });

    // Persist the PDF to disk.
    fs.mkdirSync(CERT_STORAGE_DIR, { recursive: true });
    const fileName = `${certificateCode}.pdf`;
    const filePath = path.join(CERT_STORAGE_DIR, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    const pdfUrl = `http://localhost:3000/uploads/certificates/${fileName}`;

    // Create the certificate record.
    const certificate = await Certificate.create({
      studentId: student._id,
      studentName,
      studentEmail: student.email || "",

      certificateType: "COURSE_COMPLETION",
      status: "SENT",

      issuerType: "ADMIN",
      issuedBy: req.user?._id || null,

      courseId: course._id,
      capstoneSubmissionId: capstone._id,

      title: `Certificate of Completion - ${courseTitle}`,
      websiteName: PLATFORM_BRAND.name,
      description: courseDescription,

      metadata: {
        studentName,
        entityName: courseTitle,
        subtitle: "",
        companyName: PLATFORM_BRAND.name,
        score: score,
      },

      pdfUrl,
      certificateCode,
      issueDate: new Date(),
    });

    // ============================================
    // UPDATE VERIFIED SKILLS
    // ============================================

    const category = course.category?.trim();

    if (!category) {
      console.log("Course category is empty");
    } else {
      const updatedStudent = await StudentProfile.findOneAndUpdate(
        { userId: student._id },
        {
          $addToSet: {
            verifiedSkills: category,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

      if (!updatedStudent) {
        throw new Error("Student not found while updating verified skills");
      }
    }
    // Mark capstone as issued.
    capstone.certificateIssued = true;
    capstone.certificateIssuedAt = new Date();
    await capstone.save();

    res.status(201).json({
      success: true,
      message: "Certificate issued and sent successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
