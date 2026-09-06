import api from "../../services/axios";

/* =========================================================
   STUDENT COURSE API
========================================================= */

export const getPublishedCoursesApi = async () => {
  const response = await api.get("/student/courses");
  return response.data;
};

export const getMyEnrolledCoursesApi = async () => {
  const response = await api.get("/student/my/courses");
  return response.data;
};

export const enrollInCourseApi = async (courseId) => {
  const response = await api.post(`/student/courses/${courseId}/enroll`);
  return response.data;
};

export const getCourseLearningDataApi = async (courseId) => {
  const response = await api.get(`/student/courses/${courseId}/learn`);
  return response.data;
};

/* ---------------- Lesson Quiz ---------------- */

export const getLessonQuizApi = async (lessonId) => {
  const response = await api.get(`/student/lessons/${lessonId}/quiz`);
  return response.data;
};

export const submitLessonQuizApi = async (lessonId, answers) => {
  const response = await api.post(`/student/lessons/${lessonId}/quiz/submit`, {
    answers,
  });
  return response.data;
};

/* ---------------- Final Quiz ---------------- */

export const getFinalQuizApi = async (courseId) => {
  const response = await api.get(`/student/courses/${courseId}/quiz`);
  return response.data;
};

export const submitFinalQuizApi = async (courseId, answers) => {
  const response = await api.post(`/student/courses/${courseId}/quiz/submit`, {
    answers,
  });
  return response.data;
};

/* ---------------- Capstone ---------------- */

export const getMyCapstoneSubmissionApi = async (courseId) => {
  const response = await api.get(`/student/courses/${courseId}/capstone`);
  return response.data;
};

export const submitCapstoneApi = async (courseId, payload) => {
  const response = await api.post(
    `/student/courses/${courseId}/capstone/submit`,
    payload,
  );
  return response.data;
};
