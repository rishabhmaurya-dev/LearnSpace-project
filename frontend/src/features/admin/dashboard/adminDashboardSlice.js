import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAdminDashboardStats,
  fetchAdminPendingItems,
  fetchAdminActivity,
  fetchAdminLeaderboard,
  fetchCourseOverview,
} from "./adminDashboardThunks";

const initialState = {
  statistics: null,
  growth: null,
  categories: [],
  pendingCapstones: [],
  activity: [],
  leaderboard: [],
  courses: [],
  loading: false,
  pendingLoading: false,
  activityLoading: false,
  leaderboardLoading: false,
  coursesLoading: false,
  error: null,
  pendingError: null,
  activityError: null,
  leaderboardError: null,
  coursesError: null,
};

const adminDashboardSlice = createSlice({
  name: "adminDashboard",

  initialState,

  reducers: {
    clearAdminDashboardError: (state) => {
      state.error = null;
      state.pendingError = null;
      state.activityError = null;
      state.leaderboardError = null;
      state.coursesError = null;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       STATS
    ===================================================== */

    builder
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAdminDashboardStats.fulfilled, (state, action) => {
        state.loading = false;

        state.statistics = action.payload.statistics;
        state.growth = action.payload.growth || null;
        state.categories = action.payload.categories || [];
      })

      .addCase(fetchAdminDashboardStats.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      });

    /* =====================================================
       PENDING ITEMS
    ===================================================== */

    builder
      .addCase(fetchAdminPendingItems.pending, (state) => {
        state.pendingLoading = true;
        state.pendingError = null;
      })

      .addCase(fetchAdminPendingItems.fulfilled, (state, action) => {
        state.pendingLoading = false;
        state.pendingCapstones = action.payload.pendingCapstones || [];
      })

      .addCase(fetchAdminPendingItems.rejected, (state, action) => {
        state.pendingLoading = false;

        state.pendingError = action.payload;
      });

    /* =====================================================
       RECENT ACTIVITY
    ===================================================== */

    builder
      .addCase(fetchAdminActivity.pending, (state) => {
        state.activityLoading = true;

        state.activityError = null;
      })

      .addCase(fetchAdminActivity.fulfilled, (state, action) => {
        state.activityLoading = false;

        state.activity = action.payload.activity || [];
      })

      .addCase(fetchAdminActivity.rejected, (state, action) => {
        state.activityLoading = false;

        state.activityError = action.payload;
      });

    /* =====================================================
       LEADERBOARD
    ===================================================== */

    builder
      .addCase(fetchAdminLeaderboard.pending, (state) => {
        state.leaderboardLoading = true;

        state.leaderboardError = null;
      })

      .addCase(fetchAdminLeaderboard.fulfilled, (state, action) => {
        state.leaderboardLoading = false;

        state.leaderboard = action.payload.leaderboard || [];
      })

      .addCase(fetchAdminLeaderboard.rejected, (state, action) => {
        state.leaderboardLoading = false;

        state.leaderboardError = action.payload;
      });

    /* =====================================================
       COURSES
    ===================================================== */

    builder
      .addCase(fetchCourseOverview.pending, (state) => {
        state.coursesLoading = true;

        state.coursesError = null;
      })

      .addCase(fetchCourseOverview.fulfilled, (state, action) => {
        state.coursesLoading = false;

        state.courses = action.payload.courses || [];
      })

      .addCase(fetchCourseOverview.rejected, (state, action) => {
        state.coursesLoading = false;

        state.coursesError = action.payload;
      });
  },
});

export const { clearAdminDashboardError } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
