import api from "../../services/axios";

/* =========================================================
   STUDENT CERTIFICATE API
   ========================================================= */

/**
 * GET /student/certificates
 * Returns the student's certificates split into
 * { courseCompletion, companyProject }.
 */
export const getMyCertificatesApi = async () => {
  const response = await api.get("/student/certificates");

  return response.data;
};

/**
 * GET /student/certificates/:certificateId/pdf
 * Streams the certificate PDF for download.
 */
export const downloadCertificatePdfApi = async (certificateId) => {
  const response = await api.get(`/student/certificates/${certificateId}/pdf`, {
    responseType: "blob",
  });

  return response.data;
};
