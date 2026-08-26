import api from "../../../services/axios";

/* =========================================================
   ADMIN CERTIFICATE API
   ========================================================= */

/**
 * GET /admin/certificates
 * List all issued certificates (optional type filter).
 */
export const getCertificatesApi = async (params = {}) => {
  const response = await api.get("/admin/certificates", { params });

  return response.data;
};

/**
 * POST /admin/certificates/preview
 * Build a certificate preview for an approved capstone (no persistence).
 */
export const previewCertificateApi = async (capstoneSubmissionId) => {
  const response = await api.post("/admin/certificates/preview", {
    capstoneSubmissionId,
  });

  return response.data;
};

/**
 * POST /admin/certificates/send
 * Generate + persist + send a certificate for an approved capstone.
 */
export const sendCertificateApi = async (capstoneSubmissionId) => {
  const response = await api.post("/admin/certificates/send", {
    capstoneSubmissionId,
  });

  return response.data;
};
