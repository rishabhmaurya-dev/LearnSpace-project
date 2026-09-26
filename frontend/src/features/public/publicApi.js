import api from "../../services/axios";

export const getPublicCoursesApi = async (params = {}) => {
  const response = await api.get("/public/courses", { params });
  return response.data;
};
