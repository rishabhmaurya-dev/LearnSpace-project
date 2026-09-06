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