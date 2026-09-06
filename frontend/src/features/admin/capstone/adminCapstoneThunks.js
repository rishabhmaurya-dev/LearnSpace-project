import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getCapstoneStatsApi,
  getCapstoneSubmissionsApi,
  getPendingCapstonesApi,
  getCapstoneDetailsApi,
  approveCapstoneApi,
  rejectCapstoneApi,
} from "./adminCapstoneApi";

export const fetchCapstoneStats = createAsyncThunk(
  "adminCapstone/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getCapstoneStatsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch capstone statistics",
      );
    }
  },
);

export const fetchCapstoneSubmissions = createAsyncThunk(
  "adminCapstone/fetchSubmissions",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getCapstoneSubmissionsApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch capstone submissions",
      );
    }
  },
);

export const fetchPendingCapstones = createAsyncThunk(
  "adminCapstone/fetchPending",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getPendingCapstonesApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending capstones",
      );
    }
  },
);

export const fetchCapstoneDetails = createAsyncThunk(
  "adminCapstone/fetchDetails",
  async (submissionId, { rejectWithValue }) => {
    try {
      return await getCapstoneDetailsApi(submissionId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch capstone details",
      );
    }
  },
);

export const approveCapstone = createAsyncThunk(
  "adminCapstone/approve",
  async ({ submissionId, feedback = "" }, { rejectWithValue }) => {
    try {
      return await approveCapstoneApi(submissionId, feedback);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve capstone",
      );
    }
  },
);

export const rejectCapstone = createAsyncThunk(
  "adminCapstone/reject",
  async ({ submissionId, feedback }, { rejectWithValue }) => {
    try {
      return await rejectCapstoneApi(submissionId, feedback);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject capstone",
      );
    }
  },
);