import api from "../../../services/axios";

export const getCertificatesApi = async (params = {}) => {
  const response = await api.get("/admin/certificates", { params });

  return response.data;
};

export const previewCertificateApi = async (capstoneSubmissionId) => {
  const response = await api.post(
    "/admin/certificates/preview",
    { capstoneSubmissionId },
    { responseType: "blob" },
  );

  return response.data;
};

export const sendCertificateApi = async (capstoneSubmissionId) => {
  const response = await api.post("/admin/certificates/send", {
    capstoneSubmissionId,
  });

  return response.data;
};

export const deleteCertificateApi = async (certificateId) => {
  const response = await api.delete(`/admin/certificates/${certificateId}`);

  return response.data;
};