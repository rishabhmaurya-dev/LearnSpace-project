import api from "../../../services/axios";

export const getCapstoneStatsApi = async () => {
  const response = await api.get("/admin/capstones/stats");

  return response.data;
};

export const getCapstoneSubmissionsApi = async (params = {}) => {
  const response = await api.get("/admin/capstones", {
    params,
  });

  return response.data;
};

export const getPendingCapstonesApi = async (params = {}) => {
  const response = await api.get("/admin/capstones/pending", {
    params,
  });

  return response.data;
};

export const getCapstoneDetailsApi = async (submissionId) => {
  const response = await api.get(`/admin/capstones/${submissionId}`);

  return response.data;
};

export const approveCapstoneApi = async (submissionId, feedback = "") => {
  const response = await api.patch(`/admin/capstones/${submissionId}/approve`, {
    feedback,
  });

  return response.data;
};

export const rejectCapstoneApi = async (submissionId, feedback) => {
  const response = await api.patch(`/admin/capstones/${submissionId}/reject`, {
    feedback,
  });

  return response.data;
};