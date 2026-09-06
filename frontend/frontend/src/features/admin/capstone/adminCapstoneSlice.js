import { createSlice } from "@reduxjs/toolkit";

import {
  fetchCapstoneStats,
  fetchCapstoneSubmissions,
  fetchPendingCapstones,
  fetchCapstoneDetails,
  approveCapstone,
  rejectCapstone,
} from "./adminCapstoneThunks";

const initialState = {
  /* =====================================================
     DATA
     ===================================================== */

  submissions: [],

  pendingSubmissions: [],

  selectedSubmission: null,

  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },

  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalSubmissions: 0,
    perPage: 10,
  },

  /* =====================================================
     LOADING STATES
     ===================================================== */

  loading: false,

  statsLoading: false,

  detailsLoading: false,

  operationLoading: false,

  /* =====================================================
     ERROR / SUCCESS
     ===================================================== */

  error: null,

  success: false,

  message: "",
};

const capstoneSlice = createSlice({
  name: "adminCapstone",

  initialState,

  reducers: {
    clearCapstoneError: (state) => {
      state.error = null;
    },

    clearCapstoneSuccess: (state) => {
      state.success = false;
      state.message = "";
    },

    clearSelectedSubmission: (state) => {
      state.selectedSubmission = null;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       STATISTICS
       ===================================================== */

    builder

      .addCase(fetchCapstoneStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })

      .addCase(fetchCapstoneStats.fulfilled, (state, action) => {
        state.statsLoading = false;

        state.stats = action.payload.statistics || initialState.stats;
      })

      .addCase(fetchCapstoneStats.rejected, (state, action) => {
        state.statsLoading = false;

        state.error = action.payload || "Failed to fetch capstone statistics";
      });

    /* =====================================================
       ALL SUBMISSIONS
       ===================================================== */

    builder

      .addCase(fetchCapstoneSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCapstoneSubmissions.fulfilled, (state, action) => {
        state.loading = false;

        state.submissions = action.payload.submissions || [];

        state.pagination = action.payload.pagination || initialState.pagination;
      })

      .addCase(fetchCapstoneSubmissions.rejected, (state, action) => {
        state.loading = false;

        state.submissions = [];

        state.error = action.payload || "Failed to fetch capstone submissions";
      });

    /* =====================================================
       PENDING SUBMISSIONS
       ===================================================== */

    builder

      .addCase(fetchPendingCapstones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPendingCapstones.fulfilled, (state, action) => {
        state.loading = false;

        state.pendingSubmissions = action.payload.submissions || [];
      })

      .addCase(fetchPendingCapstones.rejected, (state, action) => {
        state.loading = false;

        state.pendingSubmissions = [];

        state.error = action.payload || "Failed to fetch pending capstones";
      });

    /* =====================================================
       SINGLE SUBMISSION DETAILS
       ===================================================== */

    builder

      .addCase(fetchCapstoneDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })

      .addCase(fetchCapstoneDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;

        state.selectedSubmission = action.payload.submission || null;
      })

      .addCase(fetchCapstoneDetails.rejected, (state, action) => {
        state.detailsLoading = false;

        state.error = action.payload || "Failed to fetch capstone details";
      });

    /* =====================================================
       APPROVE
       ===================================================== */

    builder

      .addCase(approveCapstone.pending, (state) => {
        state.operationLoading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(approveCapstone.fulfilled, (state, action) => {
        state.operationLoading = false;

        state.success = true;

        state.message =
          action.payload.message || "Capstone approved successfully";
      })

      .addCase(approveCapstone.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to approve capstone";
      });

    /* =====================================================
       REJECT
       ===================================================== */

    builder

      .addCase(rejectCapstone.pending, (state) => {
        state.operationLoading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(rejectCapstone.fulfilled, (state, action) => {
        state.operationLoading = false;

        state.success = true;

        state.message =
          action.payload.message || "Capstone rejected successfully";
      })

      .addCase(rejectCapstone.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to reject capstone";
      });
  },
});

export const {
  clearCapstoneError,
  clearCapstoneSuccess,
  clearSelectedSubmission,
} = capstoneSlice.actions;

export default capstoneSlice.reducer;
