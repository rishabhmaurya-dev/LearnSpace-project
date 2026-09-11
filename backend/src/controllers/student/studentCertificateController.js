import mongoose from "mongoose";

import { Certificate } from "../../models/Certificate.model.js";
import { streamCertificatePdf } from "../../utils/certificatePdfProxy.js";

/**
 * GET /api/student/certificates
 *
 * Returns certificates belonging to the authenticated student.
 */
export async function getMyCertificates(req, res) {
  try {
    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const [courseCertificates, projectCertificates] = await Promise.all([
      Certificate.find({
        studentId,
        certificateType: "COURSE_COMPLETION",
        status: { $ne: "REVOKED" },
      })
        .sort({
          issueDate: -1,
          createdAt: -1,
        })
        .populate("courseId", "title category")
        .lean(),

      Certificate.find({
        studentId,
        certificateType: "COMPANY_PROJECT",
        status: { $ne: "REVOKED" },
      })
        .sort({
          issueDate: -1,
          createdAt: -1,
        })
        .populate("projectId", "title")
        .lean(),
    ]);

    return res.status(200).json({
      success: true,

      certificates: {
        courseCompletion: courseCertificates,
        companyProject: projectCertificates,
      },
    });
  } catch (error) {
    console.error("getMyCertificates error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/student/certificates/:certificateId/pdf
 *
 * ?inline=1
 * Opens PDF in browser.
 *
 * Without inline=1
 * Downloads PDF.
 */
export async function downloadCertificatePdf(req, res) {
  try {
    const { certificateId } = req.params;

    if (!mongoose.isValidObjectId(certificateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate id",
      });
    }

    const certificate = await Certificate.findOne({
      _id: certificateId,

      // Security:
      // Student can access only their own certificate.
      studentId: req.user?._id,

      certificateType: "COURSE_COMPLETION",

      status: {
        $ne: "REVOKED",
      },
    });

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
     * pdfUrl points to Cloudinary.
     *
     * No local /uploads/certificates path is used.
     */
    await streamCertificatePdf(req, res, certificate, inline);
  } catch (error) {
    console.error("downloadCertificatePdf error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.end();
  }
}
