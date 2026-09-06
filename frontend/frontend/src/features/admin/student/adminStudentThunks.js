import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getStudentsApi,
  getStudentDetailsApi,
  updateStudentStatusApi,
  updateStudentReputationApi,
  getStudentLeaderboardApi,
  getStudentCourseProgressApi,
  getStudentQuizHistoryApi,
  getStudentProjectHistoryApi,
} from "./adminStudentApi";

/* =========================================================
   1. GET ALL STUDENTS
   ========================================================= */

export const fetchStudents = createAsyncThunk(
  "student/fetchStudents",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getStudentsApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch students",
      );
    }
  },
);

/* =========================================================
   2. GET STUDENT DETAILS
   ========================================================= */

export const fetchStudentDetails = createAsyncThunk(
  "student/fetchStudentDetails",
  async (studentId, { rejectWithValue }) => {
    try {
      return await getStudentDetailsApi(studentId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student details",
      );
    }
  },
);

/* =========================================================
   3. UPDATE STUDENT STATUS
   ========================================================= */

export const updateStudentStatus = createAsyncThunk(
  "student/updateStudentStatus",
  async ({ studentId, isActive }, { rejectWithValue }) => {
    try {
      return await updateStudentStatusApi(studentId, isActive);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update student status",
      );
    }
  },
);

/* =========================================================
   4. UPDATE STUDENT REPUTATION
   ========================================================= */

export const updateStudentReputation = createAsyncThunk(
  "student/updateStudentReputation",
  async (
    { studentId, points, operation, reason = "" },
    { rejectWithValue },
  ) => {
    try {
      return await updateStudentReputationApi(studentId, {
        points,
        operation,
        reason,
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update student reputation",
      );
    }
  },
);

/* =========================================================
   5. GRANT BADGE
   ========================================================= */
/* Badge thunks removed */

/* =========================================================
   7. LEADERBOARD
   ========================================================= */

export const fetchStudentLeaderboard = createAsyncThunk(
  "student/fetchStudentLeaderboard",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getStudentLeaderboardApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student leaderboard",
      );
    }
  },
);

/* =========================================================
   8. COURSE PROGRESS
   ========================================================= */

export const fetchStudentCourseProgress = createAsyncThunk(
  "student/fetchStudentCourseProgress",
  async (studentId, { rejectWithValue }) => {
    try {
      return await getStudentCourseProgressApi(studentId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course progress",
      );
    }
  },
);

/* =========================================================
   9. QUIZ HISTORY
   ========================================================= */

export const fetchStudentQuizHistory = createAsyncThunk(
  "student/fetchStudentQuizHistory",
  async (studentId, { rejectWithValue }) => {
    try {
      return await getStudentQuizHistoryApi(studentId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch quiz history",
      );
    }
  },
);
