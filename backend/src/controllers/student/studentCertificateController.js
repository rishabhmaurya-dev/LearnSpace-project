import mongoose from "mongoose";
import axios from "axios";

import { Certificate } from "../../models/Certificate.model.js";

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

    const safeName = `${certificate.certificateCode}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);

    try {
      const { data } = await axios.get(certificate.pdfUrl, {
        responseType: "stream",
        maxRedirects: 3,
      });

      data.pipe(res);
    } catch (error) {
      if (!res.headersSent) {
        return res.status(502).json({
          success: false,
          message: "Failed to fetch certificate PDF",
        });
      }
      res.end();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
