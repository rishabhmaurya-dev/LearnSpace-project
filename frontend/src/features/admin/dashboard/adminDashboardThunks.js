import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getAdminDashboardStatsApi,
  getAdminPendingItemsApi,
  getAdminActivityApi,
  getAdminLeaderboardApi,
  getCourseOverviewApi,
} from "./adminDashboardApi";

export const fetchAdminDashboardStats = createAsyncThunk(
  "adminDashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminDashboardStatsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard statistics",
      );
    }
  },
);

export const fetchAdminPendingItems = createAsyncThunk(
  "adminDashboard/fetchPendingItems",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminPendingItemsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending items",
      );
    }
  },
);

export const fetchAdminActivity = createAsyncThunk(
  "adminDashboard/fetchActivity",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminActivityApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent activity",
      );
    }
  },
);

export const fetchAdminLeaderboard = createAsyncThunk(
  "adminDashboard/fetchLeaderboard",
  async (limit = 10, { rejectWithValue }) => {
    try {
      return await getAdminLeaderboardApi(limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leaderboard",
      );
    }
  },
);

export const fetchCourseOverview = createAsyncThunk(
  "adminDashboard/fetchCourseOverview",
  async (_, { rejectWithValue }) => {
    try {
      return await getCourseOverviewApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course overview",
      );
    }
  },
);