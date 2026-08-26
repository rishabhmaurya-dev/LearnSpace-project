import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStudentProfileApi,
  updateStudentProfileApi,
  getStudentDashboardApi,
} from "./studentProfileApi";

export const fetchStudentProfile = createAsyncThunk(
  "student/fetchStudentProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await getStudentProfileApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student profile",
      );
    }
  },
);

export const updateStudentProfile = createAsyncThunk(
  "student/updateStudentProfile",
  async (formData, { rejectWithValue }) => {
    try {
      return await updateStudentProfileApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update student profile",
      );
    }
  },
);

export const fetchStudentDashboard = createAsyncThunk(
  "student/fetchStudentDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await getStudentDashboardApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student dashboard",
      );
    }
  },
);
