import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPublishedCoursesApi,
  getMyEnrolledCoursesApi,
  enrollInCourseApi,
  getCourseLearningDataApi,
  getLessonQuizApi,
  submitLessonQuizApi,
  getFinalQuizApi,
  submitFinalQuizApi,
  getMyCapstoneSubmissionApi,
  submitCapstoneApi,
} from "./studentCourseApi";

export const fetchPublishedCourses = createAsyncThunk(
  "student/fetchPublishedCourses",
  async (_, { rejectWithValue }) => {
    try {
      return await getPublishedCoursesApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses",
      );
    }
  },
);

export const fetchMyEnrolledCourses = createAsyncThunk(
  "student/fetchMyEnrolledCourses",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyEnrolledCoursesApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch enrolled courses",
      );
    }
  },
);

export const enrollInCourse = createAsyncThunk(
  "student/enrollInCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      return await enrollInCourseApi(courseId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to enroll in course",
      );
    }
  },
);

export const fetchCourseLearningData = createAsyncThunk(
  "student/fetchCourseLearningData",
  async (courseId, { rejectWithValue }) => {
    try {
      return await getCourseLearningDataApi(courseId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course data",
      );
    }
  },
);

export const fetchLessonQuiz = createAsyncThunk(
  "student/fetchLessonQuiz",
  async (lessonId, { rejectWithValue }) => {
    try {
      return await getLessonQuizApi(lessonId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lesson quiz",
      );
    }
  },
);

export const submitLessonQuiz = createAsyncThunk(
  "student/submitLessonQuiz",
  async ({ lessonId, answers }, { rejectWithValue }) => {
    try {
      return await submitLessonQuizApi(lessonId, answers);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit lesson quiz",
      );
    }
  },
);

export const fetchFinalQuiz = createAsyncThunk(
  "student/fetchFinalQuiz",
  async (courseId, { rejectWithValue }) => {
    try {
      return await getFinalQuizApi(courseId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch final quiz",
      );
    }
  },
);

export const submitFinalQuiz = createAsyncThunk(
  "student/submitFinalQuiz",
  async ({ courseId, answers }, { rejectWithValue }) => {
    try {
      return await submitFinalQuizApi(courseId, answers);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit final quiz",
      );
    }
  },
);

export const fetchMyCapstoneSubmission = createAsyncThunk(
  "student/fetchMyCapstoneSubmission",
  async (courseId, { rejectWithValue }) => {
    try {
      return await getMyCapstoneSubmissionApi(courseId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch capstone submission",
      );
    }
  },
);

export const submitCapstone = createAsyncThunk(
  "student/submitCapstone",
  async ({ courseId, githubRepoUrl, liveDemoUrl }, { rejectWithValue }) => {
    try {
      return await submitCapstoneApi(courseId, { githubRepoUrl, liveDemoUrl });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit capstone",
      );
    }
  },
);
