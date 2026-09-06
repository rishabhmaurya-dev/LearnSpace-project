import api from "../../../services/axios";

/* =========================================================
   CAPSTONE API
   ========================================================= */

/**
 * GET CAPSTONE STATISTICS
 * GET /admin/capstones/stats
 */
export const getCapstoneStatsApi = async () => {
  const response = await api.get("/admin/capstones/stats");

  return response.data;
};

/**
 * GET ALL CAPSTONE SUBMISSIONS
 * GET /admin/capstones
 * Query: search, status, page, limit
 */
export const getCapstoneSubmissionsApi = async (params = {}) => {
  const response = await api.get("/admin/capstones", {
    params,
  });

  return response.data;
};

/**
 * GET PENDING CAPSTONE SUBMISSIONS
 * GET /admin/capstones/pending
 */
export const getPendingCapstonesApi = async (params = {}) => {
  const response = await api.get("/admin/capstones/pending", {
    params,
  });

  return response.data;
};

/**
 * GET SINGLE CAPSTONE DETAILS
 * GET /admin/capstones/:submissionId
 */
export const getCapstoneDetailsApi = async (submissionId) => {
  const response = await api.get(`/admin/capstones/${submissionId}`);

  return response.data;
};

/**
 * APPROVE CAPSTONE
 * PATCH /admin/capstones/:submissionId/approve
 */
export const approveCapstoneApi = async (submissionId, feedback = "") => {
  const response = await api.patch(`/admin/capstones/${submissionId}/approve`, {
    feedback,
  });

  return response.data;
};

/**
 * REJECT CAPSTONE
 * PATCH /admin/capstones/:submissionId/reject
 */
export const rejectCapstoneApi = async (submissionId, feedback) => {
  const response = await api.patch(`/admin/capstones/${submissionId}/reject`, {
    feedback,
  });

  return response.data;
};
