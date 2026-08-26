import PDFDocument from "pdfkit";
import QRCode from "qrcode";

/**
 * =========================================================
 * PLATFORM BRAND
 * =========================================================
 */

export const PLATFORM_BRAND = {
  name: "SkillBridge LMS",
  tagline: "Bridging Skills, Building Careers",
  website:
    process.env.FRONTEND_URL ||
    "https://skillbridge-lms.example.com",
};

/**
 * =========================================================
 * COLORS
 * =========================================================
 */

const COLORS = {
  navy: "#172554",
  blue: "#4f46e5",
  blueLight: "#6366f1",

  gold: "#b8860b",
  goldLight: "#d4af37",
  goldDark: "#8a6508",

  text: "#1e293b",
  muted: "#64748b",
  lightText: "#94a3b8",

  border: "#d9dee8",
  background: "#fdfdfc",
  white: "#ffffff",

  success: "#15803d",
};

/**
 * =========================================================
 * GOLD OFFICIAL SEAL
 * =========================================================
 */

function drawGoldSeal(doc, x, y, radius = 34) {
  doc.save();

  // Outer seal / starburst
  const points = 20;

  doc.moveTo(
    x + radius,
    y
  );

  for (let i = 0; i < points * 2; i++) {
    const r =
      i % 2 === 0
        ? radius
        : radius - 5;

    const angle =
      (i * Math.PI) / points;

    doc.lineTo(
      x + r * Math.cos(angle),
      y + r * Math.sin(angle)
    );
  }

  doc
    .closePath()
    .fill(COLORS.gold);

  // Inner circle
  doc
    .circle(
      x,
      y,
      radius - 7
    )
    .fill(COLORS.goldLight);

  // Inner border
  doc
    .circle(
      x,
      y,
      radius - 10
    )
    .lineWidth(1)
    .stroke(COLORS.goldDark);

  // Small crown/star style mark
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(COLORS.goldDark)
    .text(
      "★",
      x - 10,
      y - 17,
      {
        width: 20,
        align: "center",
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .fillColor(COLORS.goldDark)
    .text(
      "OFFICIAL",
      x - radius,
      y - 1,
      {
        width: radius * 2,
        align: "center",
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(6)
    .fillColor(COLORS.goldDark)
    .text(
      "CERTIFIED",
      x - radius,
      y + 9,
      {
        width: radius * 2,
        align: "center",
      }
    );

  doc.restore();
}

/**
 * =========================================================
 * DECORATIVE CORNER
 * =========================================================
 */

function drawCornerAccent(
  doc,
  x,
  y,
  flipX = false,
  flipY = false
) {
  const size = 55;

  const x2 = flipX
    ? x - size
    : x + size;

  const y2 = flipY
    ? y - size
    : y + size;

  doc
    .save()
    .moveTo(x, y)
    .lineTo(x2, y)
    .lineTo(x, y2)
    .closePath()
    .fill(COLORS.navy);

  doc.restore();
}

/**
 * =========================================================
 * SIGNATURE
 * =========================================================
 *
 * PDFKit built-in fonts don't contain a true handwritten
 * signature font, so we use Times-Italic to give it a
 * professional signature-like appearance.
 */

function drawSignature(
  doc,
  x,
  y,
  width = 180
) {
  doc.save();

  // Signature
  doc
    .font("Times-Italic")
    .fontSize(24)
    .fillColor(COLORS.navy)
    .text(
      "Rishabh Maurya",
      x,
      y,
      {
        width,
        align: "center",
      }
    );

  // Signature underline
  doc
    .moveTo(x + 10, y + 30)
    .lineTo(x + width - 10, y + 30)
    .lineWidth(0.8)
    .stroke(COLORS.border);

  // Position
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(COLORS.text)
    .text(
      "Authorized Signatory",
      x,
      y + 37,
      {
        width,
        align: "center",
      }
    );

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .text(
      PLATFORM_BRAND.name,
      x,
      y + 50,
      {
        width,
        align: "center",
      }
    );

  doc.restore();
}

/**
 * =========================================================
 * CERTIFICATE PDF GENERATOR
 * =========================================================
 */

export async function generateCertificatePdf({
  studentName,
  courseTitle,
  courseDescription = "",
  certificateCode,
  issueDate,
  aboutWebsite = "",
  completionSentence = "",
  appreciationSentence = "",
  companyName = PLATFORM_BRAND.name,
  verificationUrl = "",
  score = "",
}) {
  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
    margin: 0,

    info: {
      Title: `Certificate of Completion - ${
        courseTitle || "Course"
      }`,

      Author: companyName,

      Subject:
        "SkillBridge LMS Course Completion Certificate",

      Keywords:
        "SkillBridge LMS, Certificate, Completion",
    },
  });

  const chunks = [];

  doc.on("data", (chunk) => {
    chunks.push(chunk);
  });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  /**
   * =======================================================
   * BACKGROUND
   * =======================================================
   */

  doc
    .rect(
      0,
      0,
      pageWidth,
      pageHeight
    )
    .fill(COLORS.background);

  /**
   * =======================================================
   * OUTER BORDER
   * =======================================================
   */

  doc
    .roundedRect(
      18,
      18,
      pageWidth - 36,
      pageHeight - 36,
      10
    )
    .lineWidth(2.2)
    .stroke(COLORS.navy);

  /**
   * =======================================================
   * GOLD INNER BORDER
   * =======================================================
   */

  doc
    .roundedRect(
      25,
      25,
      pageWidth - 50,
      pageHeight - 50,
      7
    )
    .lineWidth(1)
    .stroke(COLORS.gold);

  /**
   * =======================================================
   * VERY LIGHT INNER FRAME
   * =======================================================
   */

  doc
    .roundedRect(
      31,
      31,
      pageWidth - 62,
      pageHeight - 62,
      5
    )
    .lineWidth(0.35)
    .stroke("#e2e8f0");

  /**
   * =======================================================
   * CORNER ACCENTS
   * =======================================================
   */

  drawCornerAccent(
    doc,
    20,
    20,
    false,
    false
  );

  drawCornerAccent(
    doc,
    pageWidth - 20,
    pageHeight - 20,
    true,
    true
  );

  /**
   * =======================================================
   * TOP BRAND
   * =======================================================
   */

  let y = 54;

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLORS.blue)
    .text(
      companyName.toUpperCase(),
      0,
      y,
      {
        width: pageWidth,
        align: "center",
        characterSpacing: 2,
      }
    );

  y += 17;

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLORS.muted)
    .text(
      PLATFORM_BRAND.tagline,
      0,
      y,
      {
        width: pageWidth,
        align: "center",
        characterSpacing: 0.5,
      }
    );

  /**
   * =======================================================
   * MAIN TITLE
   * =======================================================
   */

  y += 32;

  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor(COLORS.navy)
    .text(
      "CERTIFICATE OF COMPLETION",
      0,
      y,
      {
        width: pageWidth,
        align: "center",
        characterSpacing: 2.5,
      }
    );

  /**
   * Gold divider
   */

  y += 39;

  const dividerWidth = 150;

  doc
    .moveTo(
      (pageWidth - dividerWidth) / 2,
      y
    )
    .lineTo(
      (pageWidth + dividerWidth) / 2,
      y
    )
    .lineWidth(1.8)
    .stroke(COLORS.gold);

  /**
   * =======================================================
   * CERTIFICATION TEXT
   * =======================================================
   */

  y += 15;

  doc
    .font("Helvetica-Oblique")
    .fontSize(10.5)
    .fillColor(COLORS.muted)
    .text(
      "This is to certify that",
      0,
      y,
      {
        width: pageWidth,
        align: "center",
      }
    );

  /**
   * =======================================================
   * STUDENT NAME
   * =======================================================
   */

  y += 19;

  const nameText =
    studentName || "Student Name";

  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor(COLORS.blue)
    .text(
      nameText,
      0,
      y,
      {
        width: pageWidth,
        align: "center",
      }
    );

  /**
   * Name underline
   */

  y += 35;

  const nameWidth =
    doc.widthOfString(
      nameText,
      {
        size: 28,
        font: "Helvetica-Bold",
      }
    );

  const underlineWidth =
    Math.max(
      nameWidth + 45,
      220
    );

  doc
    .moveTo(
      (pageWidth - underlineWidth) / 2,
      y
    )
    .lineTo(
      (pageWidth + underlineWidth) / 2,
      y
    )
    .lineWidth(0.8)
    .stroke(COLORS.border);

  /**
   * =======================================================
   * COMPLETION SENTENCE
   * =======================================================
   */

  y += 12;

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(
      completionSentence ||
        "has successfully completed the course",
      0,
      y,
      {
        width: pageWidth,
        align: "center",
      }
    );

  /**
   * =======================================================
   * COURSE TITLE
   * =======================================================
   */

  y += 19;

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(COLORS.navy)
    .text(
      `“${courseTitle || "Course Title"}”`,
      70,
      y,
      {
        width: pageWidth - 140,
        align: "center",
      }
    );

  /**
   * =======================================================
   * COURSE DESCRIPTION
   * =======================================================
   */

  y += 27;

  if (courseDescription) {
    const description =
      courseDescription.length > 240
        ? `${courseDescription.substring(
            0,
            237
          )}...`
        : courseDescription;

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLORS.muted)
      .text(
        description,
        130,
        y,
        {
          width: pageWidth - 260,
          align: "center",
          lineGap: 1.5,
        }
      );

    y +=
      doc.heightOfString(
        description,
        {
          width: pageWidth - 260,
        }
      ) + 5;
  }

  /**
   * =======================================================
   * APPRECIATION
   * =======================================================
   */

  if (appreciationSentence) {
    const appreciation =
      appreciationSentence.length > 180
        ? `${appreciationSentence.substring(
            0,
            177
          )}...`
        : appreciationSentence;

    doc
      .font("Helvetica-Oblique")
      .fontSize(8.5)
      .fillColor(COLORS.blue)
      .text(
        `"${appreciation}"`,
        150,
        y,
        {
          width: pageWidth - 300,
          align: "center",
        }
      );
  }

  /**
   * =======================================================
   * BOTTOM SECTION
   * =======================================================
   */

  const footerY =
    pageHeight - 135;

  /**
   * LEFT - CERTIFICATE DETAILS
   */

  const detailsX = 55;

  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(COLORS.navy)
    .text(
      "CERTIFICATE DETAILS",
      detailsX,
      footerY,
      {
        width: 190,
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(
      `Issue Date: ${
        issueDate || "N/A"
      }`,
      detailsX,
      footerY + 15,
      {
        width: 210,
      }
    );

  doc
    .text(
      `Credential ID: ${
        certificateCode || "N/A"
      }`,
      detailsX,
      footerY + 28,
      {
        width: 210,
      }
    );

  if (score) {
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLORS.success)
      .text(
        `Grade / Score: ${score}`,
        detailsX,
        footerY + 41,
        {
          width: 210,
        }
      );
  }

  /**
   * =======================================================
   * CENTER - GOLD SEAL
   * =======================================================
   */

  drawGoldSeal(
    doc,
    pageWidth / 2,
    footerY + 27,
    32
  );

  /**
   * =======================================================
   * RIGHT - SIGNATURE
   * =======================================================
   */

  const signatureWidth = 180;

  const signatureX =
    pageWidth - 255;

  drawSignature(
    doc,
    signatureX,
    footerY - 3,
    signatureWidth
  );

  /**
   * =======================================================
   * QR CODE
   * =======================================================
   */

  if (verificationUrl) {
    try {
      const qrDataUrl =
        await QRCode.toDataURL(
          verificationUrl,
          {
            errorCorrectionLevel: "M",

            margin: 1,

            width: 200,

            color: {
              dark: COLORS.navy,
              light: "#ffffff",
            },
          }
        );

      const qrBuffer =
        Buffer.from(
          qrDataUrl.split(",")[1],
          "base64"
        );

      const qrSize = 54;

      const qrX =
        pageWidth - 105;

      const qrY =
        footerY + 7;

      doc.image(
        qrBuffer,
        qrX,
        qrY,
        {
          width: qrSize,
          height: qrSize,
        }
      );

      doc
        .font("Helvetica")
        .fontSize(6.5)
        .fillColor(COLORS.muted)
        .text(
          "SCAN TO VERIFY",
          qrX - 8,
          qrY + qrSize + 3,
          {
            width: qrSize + 16,
            align: "center",
          }
        );
    } catch (error) {
      process.stderr.write(
        `QR generation failed: ${error.message}\n`
      );
    }
  }

  /**
   * =======================================================
   * WEBSITE / SECURITY FOOTER
   * =======================================================
   */

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(COLORS.lightText)
    .text(
      `Verified Document • ${companyName} • ${PLATFORM_BRAND.website}`,
      0,
      pageHeight - 31,
      {
        width: pageWidth,
        align: "center",
      }
    );

  /**
   * =======================================================
   * FINALIZE PDF
   * =======================================================
   */

  doc.end();

  return new Promise(
    (resolve, reject) => {
      doc.on("end", () => {
        resolve(
          Buffer.concat(chunks)
        );
      });

      doc.on("error", reject);
    }
  );
}

/**
 * =========================================================
 * CERTIFICATE PREVIEW DATA
 * =========================================================
 */

export function buildCertificatePreviewData({
  studentName,
  courseTitle,
  courseDescription = "",
  certificateCode,
  issueDate,

  aboutWebsite = `This certificate is issued by ${
    PLATFORM_BRAND.name
  } (${PLATFORM_BRAND.website}), an online learning platform that helps students master in-demand technical skills through hands-on courses and real-world projects.`,

  completionSentence =
    "has successfully completed the course",

  appreciationSentence =
    "We appreciate your dedication and hard work throughout this course.",

  companyName =
    PLATFORM_BRAND.name,

  score = "",
}) {
  return {
    companyName,

    brandName:
      PLATFORM_BRAND.name,

    brandTagline:
      PLATFORM_BRAND.tagline,

    brandWebsite:
      PLATFORM_BRAND.website,

    studentName,

    courseTitle,

    courseDescription,

    certificateCode,

    issueDate,

    aboutWebsite,

    completionSentence,

    appreciationSentence,

    score,
  };
}