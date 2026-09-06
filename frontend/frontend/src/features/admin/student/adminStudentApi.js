import api from "../../../services/axios";

/* =========================================================
   STUDENT API
   ========================================================= */

/**
 * GET ALL STUDENTS
 *
 * GET /admin/students
 *
 * Query:
 * search
 * skill
 * status
 * sortBy
 * order
 * page
 * limit
 */
export const getStudentsApi = async (params = {}) => {
  const response = await api.get("/admin/students", {
    params,
  });

  return response.data;
};

/**
 * GET STUDENT DETAILS
 *
 * GET /admin/students/:studentId
 */
export const getStudentDetailsApi = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}`);

  return response.data;
};

/**
 * UPDATE STUDENT STATUS
 *
 * PATCH /admin/students/:studentId/status
 */
export const updateStudentStatusApi = async (studentId, isActive) => {
  const response = await api.patch(`/admin/students/${studentId}/status`, {
    isActive,
  });

  return response.data;
};

/**
 * UPDATE STUDENT REPUTATION
 *
 * PATCH /admin/students/:studentId/reputation
 */
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

/* Badge API removed */

/**
 * GET STUDENT LEADERBOARD
 *
 * GET /admin/students/leaderboard
 */
export const getStudentLeaderboardApi = async (params = {}) => {
  const response = await api.get("/admin/students/leaderboard", {
    params,
  });

  return response.data;
};

/**
 * GET STUDENT COURSE PROGRESS
 *
 * GET /admin/students/:studentId/course-progress
 */
export const getStudentCourseProgressApi = async (studentId) => {
  const response = await api.get(
    `/admin/students/${studentId}/course-progress`,
  );

  return response.data;
};

/**
 * GET STUDENT QUIZ HISTORY
 *
 * GET /admin/students/:studentId/quiz-history
 */
export const getStudentQuizHistoryApi = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}/quiz-history`);

  return response.data;
};

/**
 * GET STUDENT PROJECT HISTORY
 *
 * GET /admin/students/:studentId/project-history
 */
export const getStudentProjectHistoryApi = async (studentId) => {
  const response = await api.get(
    `/admin/students/${studentId}/project-history`,
  );

  return response.data;
};
