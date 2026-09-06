import api from "../../services/axios";

export const getAdminCoursesApi = async (params = {}) => {
  const response = await api.get("/admin/courses", { params });

  return response.data;
};

export const getAdminCourseDetailsApi = async (courseId) => {
  const response = await api.get(`/admin/courses/${courseId}`);

  return response.data;
};

export const createAdminCourseApi = async (formData) => {
  const response = await api.post("/admin/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const updateAdminCourseApi = async (courseId, formData) => {
  const response = await api.put(`/admin/courses/${courseId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const updateCapstoneApi = async (courseId, payload) => {
  const response = await api.patch(
    `/admin/courses/${courseId}/capstone`,
    payload,
  );

  return response.data;
};

export const deleteCourseApi = async (courseId) => {
  const response = await api.delete(`/admin/courses/${courseId}`);

  return response.data;
};

export const publishCourseApi = async (courseId) => {
  const response = await api.patch(`/admin/courses/${courseId}/publish`);

  return response.data;
};

export const unpublishCourseApi = async (courseId) => {
  const response = await api.patch(`/admin/courses/${courseId}/unpublish`);

  return response.data;
};

export const getCourseLessonsApi = async (courseId) => {
  const response = await api.get(`/admin/lessons/course/${courseId}`);

  return response.data;
};

export const uploadLessonMarkdownApi = async (courseId, file) => {
  const formData = new FormData();

  formData.append("lessonFile", file);

  const response = await api.post(
    `/admin/lessons/course/${courseId}/markdown`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
};

export const uploadLessonWithMcqApi = async (
  courseId,
  markdownFile,
  mcqCsvFile,
) => {
  const formData = new FormData();

  formData.append("lessonFile", markdownFile);

  if (mcqCsvFile) {
    formData.append("lessonMcqCsv", mcqCsvFile);
  }

  const response = await api.post(
    `/admin/lessons/course/${courseId}/markdown-with-mcq`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
};

export const uploadMultipleLessonMarkdownApi = async (courseId, files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("lessonFiles", file);
  });

  const response = await api.post(
    `/admin/lessons/course/${courseId}/markdown/bulk`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
};

export const deleteLessonApi = async (lessonId) => {
  const response = await api.delete(`/admin/lessons/${lessonId}`);

  return response.data;
};

export const uploadLessonMcqCsvApi = async (lessonId, file) => {
  const formData = new FormData();

  formData.append("csvFile", file);

  const response = await api.post(
    `/admin/lesson-quizzes/lesson/${lessonId}/csv`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
};

export const getLessonMcqsApi = async (lessonId) => {
  const response = await api.get(`/admin/lesson-quizzes/lesson/${lessonId}`);

  return response.data;
};

export const deleteLessonMcqsApi = async (lessonId) => {
  const response = await api.delete(`/admin/lesson-quizzes/lesson/${lessonId}`);

  return response.data;
};

export const uploadFinalQuizCsvApi = async (courseId, file) => {
  const formData = new FormData();

  formData.append("csvFile", file);

  const response = await api.post(
    `/admin/course-quizzes/course/${courseId}/final-quiz/csv`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
};
