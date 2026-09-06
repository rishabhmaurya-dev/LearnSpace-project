import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getAdminCoursesApi,
  getAdminCourseDetailsApi,
  createAdminCourseApi,
  updateAdminCourseApi,
  updateCapstoneApi,
  deleteCourseApi,
  publishCourseApi,
  unpublishCourseApi,
  getCourseLessonsApi,
  uploadLessonMarkdownApi,
  uploadLessonWithMcqApi,
  uploadMultipleLessonMarkdownApi,
  deleteLessonApi,
  uploadLessonMcqCsvApi,
  getLessonMcqsApi,
  deleteLessonMcqsApi,
  uploadFinalQuizCsvApi,
} from "./courseApi";

const getError = (error, fallback) => error.response?.data?.message || fallback;

/* =========================================================
   1. FETCH ALL COURSES
   ========================================================= */

export const fetchAdminCourses = createAsyncThunk(
  "adminCourse/fetchCourses",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAdminCoursesApi(params);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to fetch courses"));
    }
  },
);

/* =========================================================
   2. FETCH COURSE DETAILS
   ========================================================= */

export const fetchAdminCourseDetails = createAsyncThunk(
  "adminCourse/fetchDetails",
  async (courseId, { rejectWithValue }) => {
    try {
      return await getAdminCourseDetailsApi(courseId);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to fetch course details"));
    }
  },
);

/* =========================================================
   3. CREATE COURSE (STEP 1)
   ========================================================= */

export const createAdminCourse = createAsyncThunk(
  "adminCourse/create",
  async (formData, { rejectWithValue }) => {
    try {
      return await createAdminCourseApi(formData);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to create course"));
    }
  },
);

/* =========================================================
   4. UPDATE COURSE (STEP 1 EDIT)
   ========================================================= */

export const updateAdminCourse = createAsyncThunk(
  "adminCourse/update",
  async ({ courseId, formData }, { rejectWithValue }) => {
    try {
      return await updateAdminCourseApi(courseId, formData);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to update course"));
    }
  },
);

/* =========================================================
   5. UPDATE CAPSTONE (STEP 4)
   ========================================================= */

export const updateCourseCapstone = createAsyncThunk(
  "adminCourse/updateCapstone",
  async ({ courseId, payload }, { rejectWithValue }) => {
    try {
      return await updateCapstoneApi(courseId, payload);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to update capstone"));
    }
  },
);

/* =========================================================
   6. DELETE COURSE
   ========================================================= */

export const deleteAdminCourse = createAsyncThunk(
  "adminCourse/delete",
  async (courseId, { rejectWithValue }) => {
    try {
      return await deleteCourseApi(courseId);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to delete course"));
    }
  },
);

/* =========================================================
   7. PUBLISH COURSE
   ========================================================= */

export const publishAdminCourse = createAsyncThunk(
  "adminCourse/publish",
  async (courseId, { rejectWithValue }) => {
    try {
      return await publishCourseApi(courseId);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to publish course"));
    }
  },
);

/* =========================================================
   8. UNPUBLISH COURSE
   ========================================================= */

export const unpublishAdminCourse = createAsyncThunk(
  "adminCourse/unpublish",
  async (courseId, { rejectWithValue }) => {
    try {
      return await unpublishCourseApi(courseId);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to unpublish course"));
    }
  },
);

/* =========================================================
   9. FETCH COURSE LESSONS
   ========================================================= */

export const fetchCourseLessons = createAsyncThunk(
  "adminCourse/fetchLessons",
  async (courseId, { rejectWithValue }) => {
    try {
      return await getCourseLessonsApi(courseId);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to fetch lessons"));
    }
  },
);

/* =========================================================
   10. UPLOAD SINGLE LESSON MARKDOWN
   ========================================================= */

export const uploadLessonMarkdown = createAsyncThunk(
  "adminCourse/uploadLessonMarkdown",
  async ({ courseId, file }, { rejectWithValue }) => {
    try {
      return await uploadLessonMarkdownApi(courseId, file);
    } catch (error) {
      return rejectWithValue(
        getError(error, "Failed to upload lesson markdown"),
      );
    }
  },
);

/* =========================================================
   11. UPLOAD LESSON MARKDOWN + MCQ CSV (combined)
   ========================================================= */

export const uploadLessonWithMcq = createAsyncThunk(
  "adminCourse/uploadLessonWithMcq",
  async ({ courseId, markdownFile, mcqCsvFile }, { rejectWithValue }) => {
    try {
      return await uploadLessonWithMcqApi(courseId, markdownFile, mcqCsvFile);
    } catch (error) {
      return rejectWithValue(
        getError(error, "Failed to upload lesson with MCQs"),
      );
    }
  },
);

/* =========================================================
   12. UPLOAD MULTIPLE LESSON MARKDOWN FILES
   ========================================================= */

export const uploadMultipleLessons = createAsyncThunk(
  "adminCourse/uploadMultipleLessons",
  async ({ courseId, files }, { rejectWithValue }) => {
    try {
      return await uploadMultipleLessonMarkdownApi(courseId, files);
    } catch (error) {
      return rejectWithValue(
        getError(error, "Failed to upload lesson markdown files"),
      );
    }
  },
);

/* =========================================================
   12. DELETE LESSON
   ========================================================= */

export const deleteLesson = createAsyncThunk(
  "adminCourse/deleteLesson",
  async ({ lessonId, courseId }, { rejectWithValue }) => {
    try {
      const result = await deleteLessonApi(lessonId);

      return { result, courseId };
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to delete lesson"));
    }
  },
);

/* =========================================================
   13. UPLOAD LESSON MCQ CSV
   ========================================================= */

export const uploadLessonMcqCsv = createAsyncThunk(
  "adminCourse/uploadLessonMcqCsv",
  async ({ lessonId, file }, { rejectWithValue }) => {
    try {
      return await uploadLessonMcqCsvApi(lessonId, file);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to upload lesson MCQs"));
    }
  },
);

/* =========================================================
   14. FETCH LESSON MCQs
   ========================================================= */

export const fetchLessonMcqs = createAsyncThunk(
  "adminCourse/fetchLessonMcqs",
  async (lessonId, { rejectWithValue }) => {
    try {
      return await getLessonMcqsApi(lessonId);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to fetch lesson MCQs"));
    }
  },
);

/* =========================================================
   15. DELETE LESSON MCQs
   ========================================================= */

export const deleteLessonMcqs = createAsyncThunk(
  "adminCourse/deleteLessonMcqs",
  async ({ lessonId, courseId }, { rejectWithValue }) => {
    try {
      const result = await deleteLessonMcqsApi(lessonId);

      return { result, courseId };
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to delete lesson MCQs"));
    }
  },
);

/* =========================================================
   16. UPLOAD FINAL COURSE QUIZ CSV
   ========================================================= */

export const uploadFinalQuizCsv = createAsyncThunk(
  "adminCourse/uploadFinalQuizCsv",
  async ({ courseId, file }, { rejectWithValue }) => {
    try {
      return await uploadFinalQuizCsvApi(courseId, file);
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to upload final quiz"));
    }
  },
);

/* =========================================================
   REFRESH COURSE DETAILS (after uploads)
   ========================================================= */

export const refreshCourseDetails = (courseId) => (dispatch) => {
  return dispatch(fetchAdminCourseDetails(courseId));
};
