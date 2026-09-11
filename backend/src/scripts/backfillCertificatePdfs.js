import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Certificate } from "../models/Certificate.model.js";
import {
  generateCertificateFromTemplate,
  CERT_ISSUER,
  PLATFORM_BRAND,
} from "../utils/certificateGenerator.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERT_STORAGE_DIR = path.resolve(__dirname, "../../uploads/certificates");

function formatIssueDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

async function backfill() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    fs.mkdirSync(CERT_STORAGE_DIR, { recursive: true });

    const certificates = await Certificate.find({})
      .select(
        "certificateCode studentName metadata issueDate courseId projectId",
      )
      .lean();

    let restored = 0;
    let skipped = 0;
    let failed = 0;

    for (const cert of certificates) {
      if (!cert.certificateCode) {
        skipped += 1;
        continue;
      }

      const localPath = path.join(
        CERT_STORAGE_DIR,
        `${cert.certificateCode}.pdf`,
      );

      if (fs.existsSync(localPath)) {
        skipped += 1;
        continue;
      }

      try {
        const pdfBuffer = await generateCertificateFromTemplate({
          studentName: cert.metadata?.studentName || cert.studentName,
          courseTitle:
            cert.metadata?.entityName || "Course Completion",
          certificateCode: cert.certificateCode,
          issueDate: formatIssueDate(cert.issueDate),
          score: cert.metadata?.score != null ? `${cert.metadata.score}%` : "",
          companyName: CERT_ISSUER,
          verificationUrl: PLATFORM_BRAND.website,
        });

        fs.writeFileSync(localPath, pdfBuffer);
        restored += 1;
        console.log(`Restored: ${cert.certificateCode}.pdf`);
      } catch (error) {
        failed += 1;
        console.error(`Failed ${cert.certificateCode}: ${error.message}`);
      }
    }

    console.log(
      `Done. restored=${restored} skipped=${skipped} failed=${failed}`,
    );
  } catch (error) {
    console.error("Backfill failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

backfill();