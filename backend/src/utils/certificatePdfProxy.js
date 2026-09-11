import axios from "axios";

import cloudinary from "../config/cloudinary.js";

/**
 * Build an authenticated Cloudinary delivery URL for a certificate's raw PDF.
 * Raw assets are often only served via signed/authenticated URLs (otherwise
 * the plain stored pdfUrl 401s), so we mint a private download link here.
 */
export function getCertificatePdfUrl(certificate) {
  try {
    const publicId = `certificates/${certificate.certificateCode}.pdf`;

    const signed = cloudinary.utils.private_download_url(publicId, "pdf", {
      resource_type: "raw",
      type: "upload",
      attachment: false,
    });

    return signed || certificate.pdfUrl;
  } catch (_) {
    return certificate.pdfUrl;
  }
}

/**
 * Stream a certificate PDF from Cloudinary with the requested disposition.
 *   - inline: true  -> opens in the browser tab
 *   - inline: false -> downloads with <certificateCode>.pdf filename
 */
export async function streamCertificatePdf(req, res, certificate, inline) {
  const safeName = `${certificate.certificateCode}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${inline ? "inline" : "attachment"}; filename="${safeName}"`,
  );

  try {
    const { data } = await axios.get(getCertificatePdfUrl(certificate), {
      responseType: "stream",
      maxRedirects: 5,
      timeout: 30000,
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
}