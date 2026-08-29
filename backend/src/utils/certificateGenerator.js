import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * =========================================================
 * PLATFORM BRAND
 * =========================================================
 */

export const CERT_ISSUER = "LearnSpace";

export const PLATFORM_BRAND = {
  name: "LearnSpace",
  tagline: "Bridging Skills, Building Careers",
  website: process.env.FRONTEND_URL || "https://google.com",
};

/**
 * =========================================================
 * COLORS
 *
 * Palette taken from the official certificate template
 * (backend/src/utils/certificate.png): cream paper, deep
 * forest green + antique gold.
 * =========================================================
 */

const COLORS = {
  background: "#F9F7F3",

  greenDark: "#032A18",
  green: "#0B3B27",
  greenLight: "#14532D",

  gold: "#D9A441",
  goldLight: "#E8C877",
  goldDark: "#A87B2F",

  ink: "#122A1E",
  muted: "#5C6B60",
  sage: "#7A8A7C",
};

/**
 * =========================================================
 * DECORATIVE CORNER RIBBON
 *
 * Folded ribbon in the top-left and bottom-right corners:
 * deep green wedge with an antique-gold rim + gold band
 * running along the diagonal. Mirrored for the bottom-right.
 * =========================================================
 */

function drawCornerRibbon(doc, pageWidth, pageHeight) {
  const size = 312;
  const inset = 22;

  // ---- Top-left corner
  doc.path(`M 0 0 L ${size} 0 L 0 ${size} Z`).fill(COLORS.goldDark);

  doc
    .path(`M ${inset} 0 L ${size - inset} 0 L 0 ${size - inset} Z`)
    .fill(COLORS.greenDark);

  // Depth highlight along the inner green hypotenuse
  doc
    .path(`M ${size - inset - 24} 0 L 0 ${size - inset - 24}`)
    .lineWidth(1.6)
    .stroke(COLORS.greenLight);

  // ---- Bottom-right corner (mirrored)
  doc
    .path(
      `M ${pageWidth} ${pageHeight} L ${
        pageWidth - size
      } ${pageHeight} L ${pageWidth} ${pageHeight - size} Z`,
    )
    .fill(COLORS.goldDark);

  doc
    .path(
      `M ${pageWidth - inset} ${pageHeight} L ${
        pageWidth - size + inset
      } ${pageHeight} L ${pageWidth} ${pageHeight - size + inset} Z`,
    )
    .fill(COLORS.greenDark);

  doc
    .path(
      `M ${pageWidth - size + inset + 24} ${pageHeight} L ${pageWidth} ${
        pageHeight - size + inset + 24
      }`,
    )
    .lineWidth(1.6)
    .stroke(COLORS.greenLight);
}

/**
 * =========================================================
 * GOLD OFFICIAL SEAL (deep-green center)
 * =========================================================
 */

function drawGoldSeal(doc, x, y, radius = 56) {
  doc.save();

  // Outer gold starburst
  const points = 24;

  doc.moveTo(x + radius, y);

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : radius - 7;

    const angle = (i * Math.PI) / points;

    doc.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
  }

  doc.closePath().fill(COLORS.gold);

  // Inner golden disc
  doc.circle(x, y, radius - 9).fill(COLORS.goldLight);

  // Deep-green core
  doc.circle(x, y, radius - 19).fill(COLORS.greenDark);

  // Gold inner rim
  doc
    .circle(x, y, radius - 21)
    .lineWidth(1.4)
    .stroke(COLORS.gold);

  // Center star
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(COLORS.gold)
    .text("★", x - 12, y - 22, {
      width: 24,
      align: "center",
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLORS.gold)
    .text("OFFICIAL", x - radius, y - 3, {
      width: radius * 2,
      align: "center",
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .fillColor(COLORS.gold)
    .text("CERTIFIED", x - radius, y + 7, {
      width: radius * 2,
      align: "center",
    });

  doc.restore();
}

/**
 * =========================================================
 * SIGNATURE (written by hand, not typed)
 *
 * PDFKit has no true handwriting font, so we draw the name
 * in Times-Italic at a larger size with a slight rotation
 * and a hand-drawn gold underline so it reads as a real
 * signature, with the role printed beneath.
 * =========================================================
 */

function drawSignature(
  doc,
  x,
  y,
  width = 140,
  name = "Rishabh Maurya",
  angle = 0,
) {
  doc.save();

  doc.translate(x + width / 2, y + 15);

  doc.rotate(angle);

  // Handwritten name
  doc
    .font("Times-Italic")
    .fontSize(27)
    .fillColor(COLORS.greenDark)
    .text(name, -width / 2, -15, {
      width,
      align: "center",
    });

  // Hand-drawn underline with a small sweep at the end
  doc
    .moveTo(-width / 2 + 12, 22)
    .lineTo(width / 2 - 14, 22)
    .lineWidth(1.4)
    .stroke(COLORS.gold);

  doc
    .moveTo(width / 2 - 14, 22)
    .quadraticCurveTo(width / 2 - 5, 27, width / 2 + 4, 20)
    .lineWidth(1)
    .stroke(COLORS.gold);

  doc.restore();

  // Role
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLORS.ink)
    .text("Authorized Signatory", x, y + 40, {
      width,
      align: "center",
    });

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .text(PLATFORM_BRAND.name, x, y + 54, {
      width,
      align: "center",
    });
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
      Title: `Certificate of Completion - ${courseTitle || "Course"}`,

      Author: companyName,

      Subject: "LearnSpace Course Completion Certificate",

      Keywords: "LearnSpace, Certificate, Completion",
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

  doc.rect(0, 0, pageWidth, pageHeight).fill(COLORS.background);

  /**
   * =======================================================
   * CORNER RIBBONS (no full border)
   * =======================================================
   */

  drawCornerRibbon(doc, pageWidth, pageHeight);

  /**
   * =======================================================
   * TOP BRAND
   * =======================================================
   */

  let y = 44;

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLORS.green)
    .text(companyName.toUpperCase(), 0, y, {
      width: pageWidth,
      align: "center",
      characterSpacing: 3,
    });

  y += 18;

  doc
    .font("Times-Italic")
    .fontSize(9)
    .fillColor(COLORS.goldDark)
    .text(PLATFORM_BRAND.tagline, 0, y, {
      width: pageWidth,
      align: "center",
      characterSpacing: 0.8,
    });

  /**
   * =======================================================
   * MAIN TITLE
   * =======================================================
   */

  y += 36;

  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor(COLORS.greenDark)
    .text("CERTIFICATE OF COMPLETION", 0, y, {
      width: pageWidth,
      align: "center",
      characterSpacing: 3,
    });

  /**
   * Gold divider
   */

  y += 44;

  const dividerWidth = 170;

  doc
    .moveTo((pageWidth - dividerWidth) / 2, y)
    .lineTo(pageWidth / 2 - 12, y)
    .lineWidth(2)
    .stroke(COLORS.goldDark);

  // Gold diamond at the center of the divider
  doc
    .save()
    .translate(pageWidth / 2, y)
    .rotate(45)
    .rect(-5, -5, 10, 10)
    .fill(COLORS.gold)
    .restore();

  doc
    .moveTo(pageWidth / 2 + 12, y)
    .lineTo((pageWidth + dividerWidth) / 2, y)
    .lineWidth(2)
    .stroke(COLORS.goldDark);

  /**
   * =======================================================
   * CERTIFICATION TEXT
   * =======================================================
   */

  y += 23;

  doc
    .font("Times-Italic")
    .fontSize(11.5)
    .fillColor(COLORS.sage)
    .text("This is to certify that", 0, y, {
      width: pageWidth,
      align: "center",
    });

  /**
   * =======================================================
   * STUDENT NAME
   * =======================================================
   */

  y += 28;

  const nameText = studentName || "Student Name";

  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor(COLORS.greenDark)
    .text(nameText, 0, y, {
      width: pageWidth,
      align: "center",
    });

  /**
   * Name underline
   */

  y += 42;

  const nameWidth = doc.widthOfString(nameText, {
    size: 30,
    font: "Helvetica-Bold",
  });

  const underlineWidth = Math.max(nameWidth + 55, 250);

  doc
    .moveTo((pageWidth - underlineWidth) / 2, y)
    .lineTo((pageWidth + underlineWidth) / 2, y)
    .lineWidth(0.9)
    .stroke(COLORS.goldDark);

  /**
   * =======================================================
   * COMPLETION SENTENCE
   * =======================================================
   */

  y += 13;

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.ink)
    .text(completionSentence || "has successfully completed the course", 0, y, {
      width: pageWidth,
      align: "center",
    });

  /**
   * =======================================================
   * COURSE TITLE
   * =======================================================
   */

  y += 20;

  doc
    .font("Helvetica-Bold")
    .fontSize(19)
    .fillColor(COLORS.green)
    .text(`“${courseTitle || "Course Title"}”`, 70, y, {
      width: pageWidth - 140,
      align: "center",
    });

  /**
   * =======================================================
   * COURSE DESCRIPTION
   * =======================================================
   */

  y += 29;

  if (courseDescription) {
    const description =
      courseDescription.length > 240
        ? `${courseDescription.substring(0, 237)}...`
        : courseDescription;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(description, 130, y, {
        width: pageWidth - 260,
        align: "center",
        lineGap: 1.5,
      });

    y +=
      doc.heightOfString(description, {
        width: pageWidth - 260,
      }) + 6;
  }

  /**
   * =======================================================
   * APPRECIATION
   * =======================================================
   */

  if (appreciationSentence) {
    const appreciation =
      appreciationSentence.length > 180
        ? `${appreciationSentence.substring(0, 177)}...`
        : appreciationSentence;

    doc
      .font("Times-Italic")
      .fontSize(9.5)
      .fillColor(COLORS.goldDark)
      .text(`"${appreciation}"`, 150, y + 2, {
        width: pageWidth - 300,
        align: "center",
      });
  }

  /**
   * =======================================================
   * BOTTOM SECTION
   * =======================================================
   */

  const footerY = 440;

  /**
   * LEFT - CERTIFICATE DETAILS
   */

  const detailsX = 55;

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLORS.greenDark)
    .text("CERTIFICATE DETAILS", detailsX, footerY, {
      width: 200,
      characterSpacing: 1.5,
    });

  doc
    .moveTo(detailsX, footerY + 14)
    .lineTo(detailsX + 120, footerY + 14)
    .lineWidth(0.8)
    .stroke(COLORS.goldDark);

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLORS.ink)
    .text(`Issue Date: ${issueDate || "N/A"}`, detailsX, footerY + 22, {
      width: 210,
    });

  doc.text(
    `Credential ID: ${certificateCode || "N/A"}`,
    detailsX,
    footerY + 36,
    {
      width: 210,
    },
  );

  if (score) {
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(COLORS.green)
      .text(`Grade / Score: ${score}`, detailsX, footerY + 50, {
        width: 210,
      });
  }

  /**
   * =======================================================
   * CENTER - GOLD SEAL
   * =======================================================
   */

  drawGoldSeal(doc, pageWidth / 2, footerY + 8, 56);

  /**
   * =======================================================
   * RIGHT - QR CODE (verify link)
   * =======================================================
   */

  if (verificationUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: "M",

        margin: 1,

        width: 200,

        color: {
          dark: COLORS.greenDark,
          light: "#ffffff",
        },
      });

      const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

      const qrSize = 54;

      const qrX = pageWidth - 102;

      const qrY = footerY + 2;

      doc.image(qrBuffer, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });

      doc
        .font("Helvetica")
        .fontSize(6.5)
        .fillColor(COLORS.muted)
        .text("SCAN TO VERIFY", qrX - 10, qrY + qrSize + 4, {
          width: qrSize + 20,
          align: "center",
        });
    } catch (error) {
      process.stderr.write(`QR generation failed: ${error.message}\n`);
    }
  }

  /**
   * =======================================================
   * ADMINISTRATOR SIGNATURES
   * =======================================================
   */

  const administrators = [
    {
      name: "Anish",
      angle: -4,
    },
    {
      name: "Rishabh",
      angle: 3,
    },
    {
      name: "Raj",
      angle: -2,
    },
  ];

  const signatureWidth = 135;

  const signatureY = footerY + 78;

  const signatureCenters = [0.36, 0.55, 0.74];

  administrators.forEach((admin, index) => {
    drawSignature(
      doc,
      pageWidth * signatureCenters[index] - signatureWidth / 2,
      signatureY,
      signatureWidth,
      admin.name,
      admin.angle,
    );
  });

  /**
   * =======================================================
   * WEBSITE / SECURITY FOOTER
   * =======================================================
   */

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(COLORS.sage)
    .text(
      `Verified Document • ${companyName} • ${PLATFORM_BRAND.website}`,
      0,
      pageHeight - 20,
      {
        width: pageWidth,
        align: "center",
      },
    );

  /**
   * =======================================================
   * FINALIZE PDF
   * =======================================================
   */

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);
  });
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

  completionSentence = "has successfully completed the course",
  appreciationSentence = "We appreciate your dedication and hard work throughout this course.",

  companyName = CERT_ISSUER,
  score = "",
}) {
  return {
    companyName,

    brandName: PLATFORM_BRAND.name,

    brandTagline: PLATFORM_BRAND.tagline,

    brandWebsite: PLATFORM_BRAND.website,

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

/**
 * =========================================================
 * TEMPLATE-BASED CERTIFICATE PDF GENERATOR
 *
 * Uses the official certificate template image
 * (backend/src/utils/certificate.png) as the full-page
 * background, stamps the dynamic fields into the blank
 * areas of the design and replaces the template QR code
 * with a fresh QR that opens the platform website when
 * scanned. Nothing overlaps the design.
 *
 * All positions below are measured against the 1492x1054
 * template image and converted to PDF points via
 * IMG_TO_PT = PAGE_W / TEMPLATE_W.
 * =========================================================
 */

const TEMPLATE_IMAGE_PATH = path.join(__dirname, "certificate.png");

// Handwritten signature font (SIL Open Font License) used to render
// the administrator names so they look like real signatures instead
// of typed text.
const SIGNATURE_FONT_PATH = path.join(
  __dirname,
  "fonts",
  "GreatVibes-Regular.ttf",
);

const PAGE_W = 841.89;
const PAGE_H = 595.28;

const TEMPLATE_W = 1492;
const TEMPLATE_H = 1054;

const IMG_TO_PT = PAGE_W / TEMPLATE_W;

// Real-pixel anchor positions on the template image.
const T = {
  // "THIS IS TO CERTIFY THAT" is printed on the template;
  // the student name is typed onto the blank line below it.
  nameLineY: 504,

  // Blank line below "has successfully completed the course".
  courseLineY: 626,

  // Blank lines in the left details block.
  issueDateLineY: 456,
  issuedByLineY: 574,
  certificateCodeLineY: 690,
  scoreLineY: 808,

  // Left details block value column (the fill-in lines span
  // roughly x180..x366 on the template).
  valueColumnLeft: 180,
  valueColumnRight: 366,

  // Template QR code area that gets covered and replaced.
  qrCover: {
    x0: 1190,
    y0: 498,
    x1: 1410,
    y1: 694,
  },
  qrCenterX: 1309,
  qrCenterY: 605,

  // Administrator signature lines at the bottom of the template
  // (dotted/solid). The signatory name is written just above each
  // line: cx is the line centre, lineY the line itself.
  signatureBlocks: [
    { cx: 330, lineY: 947, angle: -1 },
    { cx: 730, lineY: 949, angle: -1 },
    { cx: 1100, lineY: 947, angle: -2 },
  ],
};

const DEFAULT_ADMINISTRATORS = ["Anish", "Rishabh", "Raj"];

const TPL_COLORS = {
  paper: "#F9F7F3",
  greenDark: "#032A18",
  green: "#0B3B27",
  ink: "#122A1E",
};

const px = (value) => value * IMG_TO_PT;

/**
 * Shrink the font size (largest first, in the given steps) until
 * the text fits inside `maxWidth`. Returns { size, width }.
 */
function fitText(doc, text, font, startSize, maxWidth, step = 2) {
  let size = startSize;

  while (size > 7) {
    const width = doc.widthOfString(text, {
      font,
      size,
    });

    if (width <= maxWidth) {
      return { size, width };
    }

    size -= step;
  }

  return {
    size: 7,
    width: doc.widthOfString(text, {
      font,
      size: 7,
    }),
  };
}

/**
 * Generate a certificate PDF directly from the official
 * certificate template image (certificate.png). Dynamic data
 * is written into the blank slots of the design, the template's
 * QR is erased and replaced by `/verificationUrl`, and the
 * result is returned as a PDF buffer.
 */
export async function generateCertificateFromTemplate({
  studentName,
  courseTitle,
  certificateCode,
  issueDate,
  score = "",
  companyName = CERT_ISSUER,
  verificationUrl = PLATFORM_BRAND.website,
  administrators = DEFAULT_ADMINISTRATORS,
}) {
  const templateBuffer = fs.readFileSync(TEMPLATE_IMAGE_PATH);

  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
    margin: 0,

    info: {
      Title: `Certificate of Completion - ${courseTitle || "Course"}`,
      Author: companyName,
      Subject: "Course Completion Certificate",
      Keywords: "Certificate, Completion, LearnSpace",
    },
  });

  const chunks = [];

  doc.on("data", (chunk) => {
    chunks.push(chunk);
  });

  // Handwritten font for the administrator signature names.
  doc.registerFont("Signature", SIGNATURE_FONT_PATH);

  // ---- Full-page background from the template image.
  doc.image(templateBuffer, 0, 0, {
    width: PAGE_W,
    height: PAGE_H,
  });

  /* =======================================================
   * STUDENT NAME (blank line under "THIS IS TO CERTIFY THAT")
   * ======================================================= */

  if (studentName) {
    const { size } = fitText(
      doc,
      studentName,
      "Helvetica-Bold",
      30,
      px(1096) - px(436),
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(size)
      .fillColor(TPL_COLORS.greenDark)
      .text(studentName, 0, px(T.nameLineY) - size * 0.8, {
        width: PAGE_W,
        align: "center",
      });
  }

  /* =======================================================
   * COURSE TITLE (blank line below the completion sentence)
   * ======================================================= */

  if (courseTitle) {
    const { size } = fitText(
      doc,
      courseTitle,
      "Helvetica-Bold",
      20,
      px(1098) - px(438),
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(size)
      .fillColor(TPL_COLORS.green)
      .text(courseTitle, 0, px(T.courseLineY) - size * 0.8, {
        width: PAGE_W,
        align: "center",
      });
  }

  /* =======================================================
   * LEFT DETAILS BLOCK (ISSUE DATE / ISSUED BY / CODE / SCORE)
   * ======================================================= */

  const valueColumnWidth = px(T.valueColumnRight) - px(T.valueColumnLeft);

  const valueLeft = px(T.valueColumnLeft);

  const drawDetailValue = (label, lineY, options = {}) => {
    if (!label) return;

    const fontSize = options.fontSize || 11.5;

    doc
      .font("Helvetica")
      .fontSize(fontSize)
      .fillColor(TPL_COLORS.ink)
      .text(String(label), valueLeft + 3, px(lineY) - fontSize * 0.8, {
        width: valueColumnWidth - 6,
        align: "center",
      });
  };

  drawDetailValue(issueDate, T.issueDateLineY, { fontSize: 14 });
  drawDetailValue(companyName, T.issuedByLineY, { fontSize: 14 });

  if (certificateCode) {
    drawDetailValue(certificateCode, T.certificateCodeLineY, {
      fontSize: 9,
    });
  }

  if (score) {
    drawDetailValue(String(score), T.scoreLineY, {
      fontSize: 14,
    });
  }

  /* =======================================================
   * QR CODE (erase the template QR, stamp our own)
   * ======================================================= */

  if (verificationUrl) {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
      color: {
        dark: TPL_COLORS.greenDark,
        light: TPL_COLORS.paper,
      },
    });

    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

    const qrSize = px(142);

    const qrX = px(T.qrCenterX) - qrSize / 2;
    const qrY = px(T.qrCenterY) - qrSize / 2;

    // Cover the template QR with the paper background so the
    // old QR never shows and nothing overlaps.
    doc
      .rect(
        px(T.qrCover.x0),
        px(T.qrCover.y0),
        px(T.qrCover.x1 - T.qrCover.x0),
        px(T.qrCover.y1 - T.qrCover.y0),
      )
      .fill(TPL_COLORS.paper);

    // Print the caption that already exists under the new QR
    // area is part of the template, so only the QR itself is
    // stamped here (no overlap).
    doc.image(qrBuffer, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    });
  }

  /* =======================================================
   * ADMINISTRATOR SIGNATURES (Anish / Rishabh / Raj)
   *
   * Each name is written just above the template's signature
   * line in Times-Italic with a slight tilt, like a real
   * signature. The "ADMINISTRATOR" role labels are already
   * printed on the template below each line.
   * ======================================================= */

  const signatureMaxWidth = px(240);

  T.signatureBlocks.forEach((block, index) => {
    const name = administrators[index];
    if (!name) return;

    const { size } = fitText(doc, name, "Times-Italic", 30, signatureMaxWidth);

    doc.save();

    doc.translate(px(block.cx), px(block.lineY));
    doc.rotate(block.angle);

    doc
      .font("Times-Italic")
      .fontSize(size)
      .fillColor(TPL_COLORS.greenDark)
      .text(name, -signatureMaxWidth / 2, -size * 0.82, {
        width: signatureMaxWidth,
        align: "center",
      });

    doc.restore();
  });

  /* =======================================================
   * FINALIZE
   * ======================================================= */

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);
  });
}
