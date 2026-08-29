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
 * Renders the certificate from the official template (certificate.png)
 * with the dynamic data filled in, and returns the PDF as a blob
 * so the admin can see an exact preview (WYSIWYG). Nothing is
 * persisted.
 */
export const previewCertificateApi = async (capstoneSubmissionId) => {
  const response = await api.post(
    "/admin/certificates/preview",
    { capstoneSubmissionId },
    { responseType: "blob" },
  );

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

/**
 * DELETE /admin/certificates/:certificateId
 * Cascade delete a certificate (PDF + capstone reset + verified skill).
 */
export const deleteCertificateApi = async (certificateId) => {
  const response = await api.delete(`/admin/certificates/${certificateId}`);

  return response.data;
};
