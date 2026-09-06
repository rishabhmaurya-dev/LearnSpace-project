import api from "../../services/axios";

/* =========================================================
   STUDENT PROFILE API
========================================================= */

export const getStudentProfileApi = async () => {
  const response = await api.get("/student/profile/me");
  return response.data;
};

export const updateStudentProfileApi = async (formData) => {
  const response = await api.put("/student/profile/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/* =========================================================
   STUDENT DASHBOARD API
========================================================= */

export const getStudentDashboardApi = async () => {
  const response = await api.get("/student/dashboard");
  return response.data;
};
