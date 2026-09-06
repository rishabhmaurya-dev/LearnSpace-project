import api from "../../services/axios";

export const getMyCertificatesApi = async () => {
  const response = await api.get("/student/certificates");

  return response.data;
};

export const downloadCertificatePdfApi = async (certificateId) => {
  const response = await api.get(`/student/certificates/${certificateId}/pdf`, {
    responseType: "blob",
  });

  return response.data;
};