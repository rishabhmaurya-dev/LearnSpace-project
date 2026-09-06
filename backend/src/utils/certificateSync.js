import { Certificate } from "../models/Certificate.model.js";
import { CapstoneSubmission } from "../models/CapstoneSubmission.model.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Remove a certificate PDF from Cloudinary (best effort).
 */
export async function removePdfFile(pdfUrl = "") {
  try {
    if (!pdfUrl) return;

    const match = pdfUrl.match(/\/raw\/upload\/[^/]+\/(.+)\.pdf$/);
    if (match) {
      await cloudinary.uploader.destroy(match[1], { resource_type: "raw" });
    }
  } catch (error) {
    console.error("Failed to remove certificate PDF:", error.message);
  }
}

export async function reconcileCertificateIssuedStates() {
  const [certificates, capstones] = await Promise.all([
    Certificate.find({ certificateType: "COURSE_COMPLETION" })
      .select("capstoneSubmissionId pdfUrl createdAt")
      .lean(),

    CapstoneSubmission.find({ status: "APPROVED" })
      .select("_id certificateIssued certificateIssuedAt")
      .lean(),
  ]);

  // Group certificates by their capstone submission id.
  const certsByCapstone = new Map();

  for (const cert of certificates) {
    const key = cert.capstoneSubmissionId
      ? String(cert.capstoneSubmissionId)
      : null;

    if (!key) continue;

    if (!certsByCapstone.has(key)) certsByCapstone.set(key, []);

    certsByCapstone.get(key).push(cert);
  }

  const capstoneIdSet = new Set(capstones.map((cap) => String(cap._id)));

  // --------------------------------------------------------
  // 1. Remove orphan certificates
  // --------------------------------------------------------

  const orphanCerts = certificates.filter(
    (cert) =>
      cert.capstoneSubmissionId &&
      !capstoneIdSet.has(String(cert.capstoneSubmissionId)),
  );

  for (const cert of orphanCerts) {
    await removePdfFile(cert.pdfUrl);
    await Certificate.deleteOne({ _id: cert._id });
  }

  // --------------------------------------------------------
  // 2. Remove duplicate certificates per capstone
  // --------------------------------------------------------

  for (const certs of certsByCapstone.values()) {
    if (certs.length <= 1) continue;

    certs.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );

    const duplicates = certs.slice(1);

    for (const dup of duplicates) {
      await removePdfFile(dup.pdfUrl);
      await Certificate.deleteOne({ _id: dup._id });
    }
  }

  // --------------------------------------------------------
  // 3. Fix capstone issuance flags
  // --------------------------------------------------------

  const updates = [];

  for (const capstone of capstones) {
    const hasCertificate = !!certsByCapstone.get(String(capstone._id));

    if (capstone.certificateIssued !== hasCertificate) {
      updates.push({
        updateOne: {
          filter: { _id: capstone._id },
          update: {
            $set: {
              certificateIssued: hasCertificate,
              certificateIssuedAt: hasCertificate
                ? (capstone.certificateIssuedAt || new Date())
                : null,
            },
          },
        },
      });
    }
  }

  if (updates.length) {
    await CapstoneSubmission.bulkWrite(updates);
  }
}