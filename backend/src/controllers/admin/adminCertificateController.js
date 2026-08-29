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
  generateCertificateFromTemplate,
  buildCertificatePreviewData,
  CERT_ISSUER,
  PLATFORM_BRAND,
} from "../../utils/certificateGenerator.js";
import { StudentProfile } from "../../models/StudentProfile.model.js";

import {
  removePdfFile,
  reconcileCertificateIssuedStates,
} from "../../utils/certificateSync.js";

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

    // Sync certificate / capstone / UI state (dedupe + orphan cleanup + flags).
    await reconcileCertificateIssuedStates();

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
 * Renders the certificate using the official template image
 * (certificate.png) with the dynamic data filled in, and
 * streams it back as a PDF for a WYSIWYG preview. Nothing is
 * persisted.
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
    const certificateCode = makeCertificateCode();
    const issueDate = formatDate(new Date());

    const preview = buildCertificatePreviewData({
      studentName,
      courseTitle,
      courseDescription: course.description || "",
      certificateCode,
      issueDate,
      score: score != null ? `${score}%` : "",
    });

    const pdfBuffer = await generateCertificateFromTemplate({
      studentName,
      courseTitle,
      certificateCode,
      issueDate,
      score: preview.score,
      companyName: CERT_ISSUER,
      verificationUrl: PLATFORM_BRAND.website,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="certificate-preview-${certificateCode}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    res.status(200).send(pdfBuffer);
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
    const certificateCode = makeCertificateCode();
    const issueDate = formatDate(new Date());

    const verificationUrl = PLATFORM_BRAND.website;

    const preview = buildCertificatePreviewData({
      studentName,
      courseTitle,
      courseDescription: course.description || "",
      certificateCode,
      issueDate,
      score: score != null ? `${score}%` : "",
    });

    // Generate the PDF from the official certificate template
    // (certificate.png) with the dynamic data filled in.
    const pdfBuffer = await generateCertificateFromTemplate({
      studentName,
      courseTitle,
      certificateCode,
      issueDate,
      companyName: CERT_ISSUER,
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
      websiteName: CERT_ISSUER,
      description: preview.courseDescription || "",

      metadata: {
        studentName,
        entityName: courseTitle,
        subtitle: "",
        companyName: CERT_ISSUER,
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
          upsert: true,
          setDefaultsOnInsert: true,
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

/**
 * DELETE /api/admin/certificates/:certificateId
 * Deletes a certificate and its related data (cascade cleanup):
 *   - removes the generated PDF file from disk
 *   - resets the linked capstone so "Issue Certificate" appears again
 *   - removes the associated verified skill if no other certificate
 *     remains for that student + course
 */
export async function deleteCertificate(req, res) {
  try {
    const { certificateId } = req.params;

    if (!mongoose.isValidObjectId(certificateId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid certificate id" });
    }

    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    const capstoneId = certificate.capstoneSubmissionId;

    // ------------------------------------------------------------------
    // 1. Remove the PDF file
    // ------------------------------------------------------------------

    removePdfFile(certificate.pdfUrl);

    // ------------------------------------------------------------------
    // 2. Reset the linked capstone so the admin can re-issue
    // ------------------------------------------------------------------

    if (capstoneId) {
      await CapstoneSubmission.updateOne(
        { _id: capstoneId },
        {
          $set: {
            certificateIssued: false,
            certificateIssuedAt: null,
          },
        },
      );
    }

    // ------------------------------------------------------------------
    // 3. Delete the certificate record
    // ------------------------------------------------------------------

    await Certificate.deleteOne({ _id: certificate._id });

    // ------------------------------------------------------------------
    // 4. Remove the verified skill if no other certificate remains
    //    for this student + course
    // ------------------------------------------------------------------

    if (certificate.studentId && certificate.courseId) {
      const remainingCertificates = await Certificate.countDocuments({
        studentId: certificate.studentId,
        courseId: certificate.courseId,
      });

      if (remainingCertificates === 0) {
        const course = await Course.findById(certificate.courseId)
          .select("category")
          .lean();

        const category = course?.category?.trim();

        if (category) {
          await StudentProfile.updateOne(
            { userId: certificate.studentId },
            { $pull: { verifiedSkills: category } },
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Certificate deleted successfully",
      certificateId: certificate._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
