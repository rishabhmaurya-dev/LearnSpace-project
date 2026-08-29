import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { Certificate } from "../models/Certificate.model.js";
import { CapstoneSubmission } from "../models/CapstoneSubmission.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder where generated certificate PDFs are stored.
export const CERT_STORAGE_DIR = path.resolve(
  __dirname,
  "../../uploads/certificates",
);

/**
 * Remove a certificate PDF from disk (best effort).
 */
export function removePdfFile(pdfUrl = "") {
  try {
    if (!pdfUrl) return;

    const fileName = pdfUrl.split("/").pop();
    if (!fileName) return;

    const filePath = path.join(CERT_STORAGE_DIR, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Failed to remove certificate PDF:", error.message);
  }
}

/**
 * =========================================================
 * RECONCILE CERTIFICATE ISSUED STATE
 * =========================================================
 *
 * Keeps the UI in sync with manual database changes:
 *
 *  1. Orphan certificates (whose capstone is no longer approved
 *     or does not exist) are removed along with their PDFs.
 *
 *  2. Duplicate certificates for the same capstone submission
 *     are removed (the oldest one is kept).
 *
 *  3. Capstone issuance flags are fixed:
 *       - capstone has NO certificate -> certificateIssued = false
 *         (so the admin sees the "Issue Certificate" button again)
 *       - capstone HAS a certificate  -> certificateIssued = true
 */
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
    removePdfFile(cert.pdfUrl);
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
      removePdfFile(dup.pdfUrl);
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