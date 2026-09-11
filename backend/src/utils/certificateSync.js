import { Certificate } from "../models/Certificate.model.js";
import { CapstoneSubmission } from "../models/CapstoneSubmission.model.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Remove certificate PDF from Cloudinary.
 *
 * Certificates are stored only on Cloudinary.
 * No local filesystem cleanup is required because
 * Vercel has a read-only filesystem.
 */
export async function removePdfFile(pdfUrl = "", certificateCode = "") {
  try {
    if (!pdfUrl && !certificateCode) return;

    let publicId = "";

    /*
     * Preferred method:
     * certificateCode is the Cloudinary public_id.
     */
    if (certificateCode) {
      publicId = `certificates/${certificateCode}`;
    } else {
      /*
       * Fallback:
       * Extract public_id from Cloudinary raw PDF URL.
       *
       * Example:
       * /raw/upload/v123456/certificates/SBF-2026-XXXX.pdf
       */
      const match = pdfUrl.match(
        /\/raw\/upload\/(?:v\d+\/)?(.+)\.pdf(?:\?.*)?$/,
      );

      if (match) {
        publicId = match[1];
      }
    }

    if (!publicId) {
      console.warn(
        "[certificate] Could not determine Cloudinary public_id for PDF removal.",
      );
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });

    console.log(`[certificate] Cloudinary PDF removed: ${publicId}`);
  } catch (error) {
    /*
     * Best effort cleanup.
     *
     * Certificate database cleanup should not fail only because
     * Cloudinary deletion failed.
     */
    console.error(
      "[certificate] Failed to remove certificate PDF from Cloudinary:",
      error.message,
    );
  }
}

/**
 * Reconcile certificate and capstone issued states.
 *
 * Responsibilities:
 * 1. Remove orphan certificates.
 * 2. Remove duplicate certificates for the same capstone.
 * 3. Correct certificateIssued flags.
 */
export async function reconcileCertificateIssuedStates() {
  const [certificates, capstones] = await Promise.all([
    Certificate.find({
      certificateType: "COURSE_COMPLETION",
    })
      .select("_id capstoneSubmissionId pdfUrl certificateCode createdAt")
      .lean(),

    CapstoneSubmission.find({
      status: "APPROVED",
    })
      .select("_id certificateIssued certificateIssuedAt")
      .lean(),
  ]);

  // --------------------------------------------------------
  // Group certificates by capstone submission
  // --------------------------------------------------------

  const certsByCapstone = new Map();

  for (const cert of certificates) {
    const key = cert.capstoneSubmissionId
      ? String(cert.capstoneSubmissionId)
      : null;

    if (!key) continue;

    if (!certsByCapstone.has(key)) {
      certsByCapstone.set(key, []);
    }

    certsByCapstone.get(key).push(cert);
  }

  const capstoneIdSet = new Set(
    capstones.map((capstone) => String(capstone._id)),
  );

  // --------------------------------------------------------
  // 1. Remove orphan certificates
  // --------------------------------------------------------

  const orphanCerts = certificates.filter(
    (cert) =>
      cert.capstoneSubmissionId &&
      !capstoneIdSet.has(String(cert.capstoneSubmissionId)),
  );

  for (const cert of orphanCerts) {
    await removePdfFile(cert.pdfUrl, cert.certificateCode);

    await Certificate.deleteOne({
      _id: cert._id,
    });
  }

  // --------------------------------------------------------
  // 2. Remove duplicate certificates per capstone
  // --------------------------------------------------------

  for (const certs of certsByCapstone.values()) {
    if (certs.length <= 1) continue;

    certs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Keep the oldest certificate.
    const duplicates = certs.slice(1);

    for (const duplicate of duplicates) {
      await removePdfFile(duplicate.pdfUrl, duplicate.certificateCode);

      await Certificate.deleteOne({
        _id: duplicate._id,
      });
    }
  }

  // --------------------------------------------------------
  // 3. Fix capstone certificateIssued flags
  // --------------------------------------------------------

  const updates = [];

  for (const capstone of capstones) {
    const hasCertificate = !!certsByCapstone.get(String(capstone._id));

    if (capstone.certificateIssued !== hasCertificate) {
      updates.push({
        updateOne: {
          filter: {
            _id: capstone._id,
          },

          update: {
            $set: {
              certificateIssued: hasCertificate,

              certificateIssuedAt: hasCertificate
                ? capstone.certificateIssuedAt || new Date()
                : null,
            },
          },
        },
      });
    }
  }

  if (updates.length > 0) {
    await CapstoneSubmission.bulkWrite(updates);
  }
}
