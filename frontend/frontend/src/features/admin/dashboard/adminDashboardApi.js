import api from "../../../services/axios";

export const getAdminDashboardStatsApi = async () => {
  const response = await api.get("/admin/dashboard/stats");

  return response.data;
};

export const getAdminPendingItemsApi = async () => {
  const response = await api.get("/admin/dashboard/pending");

  return response.data;
};

export const getAdminActivityApi = async () => {
  const response = await api.get("/admin/dashboard/activity");

  return response.data;
};

export const getAdminLeaderboardApi = async (limit = 10) => {
  const response = await api.get("/admin/dashboard/leaderboard", {
    params: {
      limit,
    },
  });

  return response.data;
};

export const getCourseOverviewApi = async () => {
  const response = await api.get("/admin/dashboard/courses");

  return response.data;
};
