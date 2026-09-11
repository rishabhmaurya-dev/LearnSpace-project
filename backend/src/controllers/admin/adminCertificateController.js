import mongoose from "mongoose";

import { Certificate } from "../../models/Certificate.model.js";
import { CapstoneSubmission } from "../../models/CapstoneSubmission.model.js";
import { Course } from "../../models/Course.model.js";
import { User } from "../../models/User.model.js";
import { CourseProgress } from "../../models/CourseProgress.model.js";
import { StudentProfile } from "../../models/StudentProfile.model.js";

import {
  generateCertificateFromTemplate,
  buildCertificatePreviewData,
  CERT_ISSUER,
  PLATFORM_BRAND,
} from "../../utils/certificateGenerator.js";

import { createOrGetStudentProfile } from "../studentController.js";

import { reconcileCertificateIssuedStates } from "../../utils/certificateSync.js";

import cloudinary from "../../config/cloudinary.js";

import { streamCertificatePdf } from "../../utils/certificatePdfProxy.js";

/**
 * Generate a unique certificate code.
 *
 * Format:
 * SBF-2026-XXXXXXXX
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
 * Format date.
 *
 * Example:
 * 05 Jan 2026
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Upload generated PDF Buffer directly to Cloudinary.
 *
 * IMPORTANT:
 * We do NOT save the PDF to:
 *
 * backend/uploads/certificates
 *
 * because Vercel filesystem is read-only.
 */
function uploadPdfToCloudinary(pdfBuffer, certificateCode) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "certificates",

        /*
         * PDF is uploaded as a raw resource.
         */
        resource_type: "raw",

        /*
         * Certificate code becomes the
         * Cloudinary public_id.
         */
        public_id: certificateCode,

        format: "pdf",
      },

      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      },
    );

    stream.end(pdfBuffer);
  });
}

/**
 * Load approved capstone + student + course + progress.
 */
async function loadCapstoneContext(capstoneId) {
  const capstone = await CapstoneSubmission.findOne({
    _id: capstoneId,
    status: "APPROVED",
  });

  if (!capstone) {
    return null;
  }

  const [student, course] = await Promise.all([
    User.findById(capstone.studentId).lean(),

    Course.findById(capstone.courseId).lean(),
  ]);

  if (!student || !course) {
    return null;
  }

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
 */
export async function getCertificates(req, res) {
  try {
    const { type } = req.query;

    /*
     * Keep certificate/capstone state synchronized.
     */
    await reconcileCertificateIssuedStates();

    const filter = {};

    if (type === "COURSE" || type === "course") {
      filter.certificateType = "COURSE_COMPLETION";
    }

    const certificates = await Certificate.find(filter)
      .sort({
        issueDate: -1,
        createdAt: -1,
      })
      .populate("courseId", "title category")
      .populate("issuedBy", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      certificates,
    });
  } catch (error) {
    console.error("getCertificates error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /api/admin/certificates/preview
 *
 * Generates PDF in memory and directly sends it
 * to the browser.
 *
 * No filesystem write.
 */
export async function previewCertificate(req, res) {
  try {
    const { capstoneSubmissionId } = req.body;

    if (!mongoose.isValidObjectId(capstoneSubmissionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid capstone submission id",
      });
    }

    const ctx = await loadCapstoneContext(capstoneSubmissionId);

    if (!ctx) {
      return res.status(404).json({
        success: false,
        message: "Approved capstone submission not found",
      });
    }

    const { student, course, score } = ctx;

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

    /*
     * Generate PDF directly into Buffer.
     */
    const pdfBuffer = await generateCertificateFromTemplate({
      studentName,
      courseTitle,
      certificateCode,
      issueDate,

      companyName: CERT_ISSUER,

      verificationUrl: PLATFORM_BRAND.website,

      score: preview.score,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `inline; filename="certificate-preview-${certificateCode}.pdf"`,
    );

    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("previewCertificate error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /api/admin/certificates/send
 *
 * Generates certificate,
 * uploads PDF to Cloudinary,
 * stores Cloudinary URL in MongoDB,
 * marks capstone as issued.
 */
export async function sendCertificate(req, res) {
  try {
    const { capstoneSubmissionId } = req.body;

    if (!mongoose.isValidObjectId(capstoneSubmissionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid capstone submission id",
      });
    }

    const ctx = await loadCapstoneContext(capstoneSubmissionId);

    if (!ctx) {
      return res.status(404).json({
        success: false,
        message: "Approved capstone submission not found",
      });
    }

    const { capstone, student, course, score } = ctx;

    /*
     * Prevent duplicate certificates.
     */
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

    // -----------------------------------------------------
    // 1. Generate PDF in memory
    // -----------------------------------------------------

    const pdfBuffer = await generateCertificateFromTemplate({
      studentName,
      courseTitle,
      certificateCode,
      issueDate,

      companyName: CERT_ISSUER,

      verificationUrl,

      score: preview.score,
    });

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
      throw new Error("Certificate PDF generation failed");
    }

    // -----------------------------------------------------
    // 2. Upload PDF directly to Cloudinary
    // -----------------------------------------------------

    const uploadResult = await uploadPdfToCloudinary(
      pdfBuffer,
      certificateCode,
    );

    if (!uploadResult?.secure_url) {
      throw new Error("Certificate PDF upload to Cloudinary failed");
    }

    const pdfUrl = uploadResult.secure_url;

    console.log(`[certificate] PDF uploaded successfully: ${pdfUrl}`);

    // -----------------------------------------------------
    // 3. Create certificate DB record
    // -----------------------------------------------------

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

        score,
      },

      /*
       * IMPORTANT:
       *
       * This is now Cloudinary URL.
       *
       * There is NO local:
       * /uploads/certificates/...
       */
      pdfUrl,

      certificateCode,

      issueDate: new Date(),
    });

    // -----------------------------------------------------
    // 4. Update verified skills
    // -----------------------------------------------------

    const category = course.category?.trim();

    if (!category) {
      console.log("[certificate] Course category is empty");
    } else {
      const updatedStudent = await StudentProfile.findOneAndUpdate(
        {
          userId: student._id,
        },

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

    // -----------------------------------------------------
    // 5. Add reputation points
    // -----------------------------------------------------

    const studentProfile = await createOrGetStudentProfile(student._id);

    studentProfile.reputationPoints += 100;

    await studentProfile.save();

    // -----------------------------------------------------
    // 6. Mark capstone as certificate issued
    // -----------------------------------------------------

    capstone.certificateIssued = true;

    capstone.certificateIssuedAt = new Date();

    await capstone.save();

    // -----------------------------------------------------
    // 7. Response
    // -----------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Certificate issued and sent successfully. 100 reputation points added to the student.",

      certificate,
    });
  } catch (error) {
    console.error("sendCertificate error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/admin/certificates/:certificateId/pdf
 *
 * ?inline=1 -> browser preview
 * otherwise -> download
 */
export async function viewCertificatePdf(req, res) {
  try {
    const { certificateId } = req.params;

    if (!mongoose.isValidObjectId(certificateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate id",
      });
    }

    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    if (!certificate.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "PDF has not been generated for this certificate",
      });
    }

    const inline = req.query.inline === "1";

    /*
     * PDF is fetched from Cloudinary.
     */
    await streamCertificatePdf(req, res, certificate, inline);
  } catch (error) {
    console.error("viewCertificatePdf error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.end();
  }
}

/**
 * DELETE /api/admin/certificates/:certificateId
 *
 * Deletes:
 * 1. Cloudinary PDF
 * 2. Certificate DB record
 * 3. Resets capstone
 * 4. Removes verified skill when appropriate
 * 5. Rolls back reputation points
 */
export async function deleteCertificate(req, res) {
  try {
    const { certificateId } = req.params;

    if (!mongoose.isValidObjectId(certificateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate id",
      });
    }

    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const capstoneId = certificate.capstoneSubmissionId;

    // -----------------------------------------------------
    // 1. Remove PDF from Cloudinary
    // -----------------------------------------------------

    if (certificate.certificateCode) {
      try {
        await cloudinary.uploader.destroy(
          `certificates/${certificate.certificateCode}`,
          {
            resource_type: "raw",
          },
        );

        console.log(
          `[certificate] Deleted Cloudinary PDF: certificates/${certificate.certificateCode}`,
        );
      } catch (error) {
        console.warn(
          "[certificate] Cloudinary PDF deletion failed:",
          error.message,
        );
      }
    }

    // -----------------------------------------------------
    // 2. Reset linked capstone
    // -----------------------------------------------------

    if (capstoneId) {
      await CapstoneSubmission.updateOne(
        {
          _id: capstoneId,
        },

        {
          $set: {
            certificateIssued: false,

            certificateIssuedAt: null,
          },
        },
      );
    }

    // -----------------------------------------------------
    // 3. Delete certificate record
    // -----------------------------------------------------

    await Certificate.deleteOne({
      _id: certificate._id,
    });

    // -----------------------------------------------------
    // 4. Remove verified skill if no other
    // certificate exists for this student/course
    // -----------------------------------------------------

    if (certificate.studentId && certificate.courseId) {
      const remainingCertificates = await Certificate.countDocuments({
        studentId: certificate.studentId,

        courseId: certificate.courseId,

        certificateType: "COURSE_COMPLETION",

        status: {
          $ne: "REVOKED",
        },
      });

      if (remainingCertificates === 0) {
        const course = await Course.findById(certificate.courseId)
          .select("category")
          .lean();

        const category = course?.category?.trim();

        if (category) {
          await StudentProfile.updateOne(
            {
              userId: certificate.studentId,
            },

            {
              $pull: {
                verifiedSkills: category,
              },
            },
          );
        }
      }
    }

    // -----------------------------------------------------
    // 5. Rollback reputation points
    // -----------------------------------------------------

    if (certificate.studentId) {
      const studentProfile = await createOrGetStudentProfile(
        certificate.studentId,
      );

      studentProfile.reputationPoints = Math.max(
        0,
        studentProfile.reputationPoints - 100,
      );

      await studentProfile.save();
    }

    return res.status(200).json({
      success: true,

      message: "Certificate deleted successfully",

      certificateId: certificate._id,
    });
  } catch (error) {
    console.error("deleteCertificate error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
