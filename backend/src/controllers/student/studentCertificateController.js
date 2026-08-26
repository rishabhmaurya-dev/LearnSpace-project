import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Certificate } from "../../models/Certificate.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERT_STORAGE_DIR = path.resolve(
  __dirname,
  "../../../uploads/certificates",
);

/**
 * GET /api/student/certificates
 * Returns the authenticated student's certificates,
 * split into the two requested columns:
 *   - courseCompletion: COURSE_COMPLETION certificates
 *   - companyProject:   COMPANY_PROJECT certificates
 */
export async function getMyCertificates(req, res) {
  try {
    const studentId = req.user?._id;

    const [courseCertificates, projectCertificates] = await Promise.all([
      Certificate.find({
        studentId,
        certificateType: "COURSE_COMPLETION",
        status: { $ne: "REVOKED" },
      })
        .sort({ issueDate: -1, createdAt: -1 })
        .populate("courseId", "title category")
        .lean(),

      Certificate.find({
        studentId,
        certificateType: "COMPANY_PROJECT",
        status: { $ne: "REVOKED" },
      })
        .sort({ issueDate: -1, createdAt: -1 })
        .populate("projectId", "title")
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      certificates: {
        courseCompletion: courseCertificates,
        companyProject: projectCertificates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/student/certificates/:certificateId/pdf
 * Streams the generated PDF for a certificate that belongs to the student.
 */
export async function downloadCertificatePdf(req, res) {
  try {
    const { certificateId } = req.params;

    if (!mongoose.isValidObjectId(certificateId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid certificate id" });
    }

    const certificate = await Certificate.findOne({
      _id: certificateId,
      studentId: req.user?._id,
      certificateType: "COURSE_COMPLETION",
      status: { $ne: "REVOKED" },
    });

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    if (!certificate.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "PDF has not been generated for this certificate",
      });
    }

    // pdfUrl is stored as "/uploads/certificates/<file>.pdf"
    const fileName = path.basename(certificate.pdfUrl);
    const filePath = path.join(CERT_STORAGE_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate PDF file is missing" });
    }

    const safeName = `${certificate.certificateCode}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
