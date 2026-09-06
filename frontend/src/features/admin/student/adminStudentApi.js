import api from "../../../services/axios";

export const getStudentsApi = async (params = {}) => {
  const response = await api.get("/admin/students", {
    params,
  });

  return response.data;
};

export const getStudentDetailsApi = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}`);

  return response.data;
};

export const updateStudentStatusApi = async (studentId, isActive) => {
  const response = await api.patch(`/admin/students/${studentId}/status`, {
    isActive,
  });

  return response.data;
};

export const updateStudentReputationApi = async (
  studentId,
  { points, operation, reason = "" },
) => {
  const response = await api.patch(`/admin/students/${studentId}/reputation`, {
    points,
    operation,
    reason,
  });

  return response.data;
};

export const getStudentLeaderboardApi = async (params = {}) => {
  const response = await api.get("/admin/students/leaderboard", {
    params,
  });

  return response.data;
};

export const getStudentCourseProgressApi = async (studentId) => {
  const response = await api.get(
    `/admin/students/${studentId}/course-progress`,
  );

  return response.data;
};

export const getStudentQuizHistoryApi = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}/quiz-history`);

  return response.data;
};

export const getStudentProjectHistoryApi = async (studentId) => {
  const response = await api.get(
    `/admin/students/${studentId}/project-history`,
  );

  return response.data;
};