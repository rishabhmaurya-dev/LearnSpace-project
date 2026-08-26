import api from "../../services/axios";

/* =========================================================
   COURSE API
   ========================================================= */

/**
 * GET ALL COURSES (ADMIN)
 *
 * GET /admin/courses
 *
 * Query: page, limit, search, category, status
 */
export const getAdminCoursesApi = async (params = {}) => {
  const response = await api.get("/admin/courses", { params });

  return response.data;
};

/**
 * GET COURSE DETAILS (WITH LESSONS)
 *
 * GET /admin/courses/:courseId
 */
export const getAdminCourseDetailsApi = async (courseId) => {
  const response = await api.get(`/admin/courses/${courseId}`);

  return response.data;
};

/**
 * CREATE COURSE (STEP 1)
 *
 * POST /admin/courses
 * multipart/form-data
 */
export const createAdminCourseApi = async (formData) => {
  const response = await api.post("/admin/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log(response);

  return response.data;
};

/**
 * UPDATE COURSE (STEP 1 EDIT)
 *
 * PUT /admin/courses/:courseId
 * multipart/form-data
 */
export const updateAdminCourseApi = async (courseId, formData) => {
  const response = await api.put(`/admin/courses/${courseId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

/**
 * UPDATE CAPSTONE (STEP 4)
 *
 * PATCH /admin/courses/:courseId/capstone
 */
export const updateCapstoneApi = async (courseId, payload) => {
  const response = await api.patch(
    `/admin/courses/${courseId}/capstone`,
    payload,
  );

  return response.data;
};

/**
 * DELETE COURSE
 *
 * DELETE /admin/courses/:courseId
 */
export const deleteCourseApi = async (courseId) => {
  const response = await api.delete(`/admin/courses/${courseId}`);

  return response.data;
};

/**
 * PUBLISH COURSE
 *
 * PATCH /admin/courses/:courseId/publish
 */
export const publishCourseApi = async (courseId) => {
  const response = await api.patch(`/admin/courses/${courseId}/publish`);

  return response.data;
};

/**
 * UNPUBLISH COURSE
 *
 * PATCH /admin/courses/:courseId/unpublish
 */
export const unpublishCourseApi = async (courseId) => {
  const response = await api.patch(`/admin/courses/${courseId}/unpublish`);

  return response.data;
};

/* =========================================================
   LESSON API
   ========================================================= */

/**
 * GET COURSE LESSONS
 *
 * GET /admin/lessons/course/:courseId
 */
export const getCourseLessonsApi = async (courseId) => {
  const response = await api.get(`/admin/lessons/course/${courseId}`);

  return response.data;
};

/**
 * UPLOAD SINGLE LESSON MARKDOWN
 *
 * POST /admin/lessons/course/:courseId/markdown
 * multipart/form-data -> field "lessonFile"
 */
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

/**
 * UPLOAD SINGLE LESSON MARKDOWN + MCQ CSV (combined)
 *
 * POST /admin/lessons/course/:courseId/markdown-with-mcq
 * multipart/form-data -> fields "lessonFile" (.md) + "lessonMcqCsv" (.csv)
 */
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

/**
 * UPLOAD MULTIPLE LESSON MARKDOWN FILES
 *
 * POST /admin/lessons/course/:courseId/markdown/bulk
 * multipart/form-data -> field "lessonFiles" (array)
 */
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

/**
 * DELETE LESSON
 *
 * DELETE /admin/lessons/:lessonId
 */
export const deleteLessonApi = async (lessonId) => {
  const response = await api.delete(`/admin/lessons/${lessonId}`);

  return response.data;
};

/* =========================================================
   LESSON MCQs API
   ========================================================= */

/**
 * UPLOAD LESSON MCQ CSV
 *
 * POST /admin/lesson-quizzes/lesson/:lessonId/csv
 * multipart/form-data -> field "csvFile"
 */
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

/**
 * GET LESSON MCQs
 *
 * GET /admin/lesson-quizzes/lesson/:lessonId
 */
export const getLessonMcqsApi = async (lessonId) => {
  const response = await api.get(`/admin/lesson-quizzes/lesson/${lessonId}`);

  return response.data;
};

/**
 * DELETE LESSON MCQs
 *
 * DELETE /admin/lesson-quizzes/lesson/:lessonId
 */
export const deleteLessonMcqsApi = async (lessonId) => {
  const response = await api.delete(`/admin/lesson-quizzes/lesson/${lessonId}`);

  return response.data;
};

/* =========================================================
   FINAL QUIZ API
   ========================================================= */

/**
 * UPLOAD FINAL COURSE QUIZ CSV
 *
 * POST /admin/course-quizzes/course/:courseId/final-quiz/csv
 * multipart/form-data -> field "csvFile"
 */
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
