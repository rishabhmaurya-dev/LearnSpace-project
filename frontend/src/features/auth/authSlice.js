import { createSlice } from "@reduxjs/toolkit";

import {
  registerUser,
  loginUser,
  refreshUser,
  logoutUser,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
} from "./authThunks";

const initialState = {
  user: null,

  accessToken: null,

  isAuthenticated: false,

  loading: false,

  rehydrating: true,

  error: null,

  success: false,

  message: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    clearAuthSuccess: (state) => {
      state.success = false;
      state.message = null;
    },

    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },

    logoutLocal: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.rehydrating = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // =========================================
    // REGISTER
    // =========================================

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // =========================================
    // LOGIN
    // =========================================

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload.user;

        state.accessToken = action.payload.accessToken;

        state.isAuthenticated = true;

        state.error = null;

        state.success = true;

        state.message = action.payload.message;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        state.user = null;

        state.accessToken = null;

        state.isAuthenticated = false;

        state.error = action.payload;

        state.success = false;
      });

    // =========================================
    // REFRESH
    // =========================================

    builder
      .addCase(refreshUser.pending, (state) => {
        state.rehydrating = true;
      })

      .addCase(refreshUser.fulfilled, (state, action) => {
        state.rehydrating = false;

        state.user = action.payload.user;

        state.accessToken = action.payload.accessToken;

        state.isAuthenticated = true;

        state.error = null;
      })

      .addCase(refreshUser.rejected, (state) => {
        state.rehydrating = false;

        state.user = null;

        state.accessToken = null;

        state.isAuthenticated = false;
      });

    // =========================================
    // LOGOUT
    // =========================================

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = null;

        state.accessToken = null;

        state.isAuthenticated = false;

        state.loading = false;

        state.success = true;

        state.message = action.payload.message;

        state.error = null;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      });

    // =========================================
    // LOGOUT ALL
    // =========================================

    builder
      .addCase(logoutAllDevices.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutAllDevices.fulfilled, (state, action) => {
        state.user = null;

        state.accessToken = null;

        state.isAuthenticated = false;

        state.loading = false;

        state.success = true;

        state.message = action.payload.message;

        state.error = null;
      })

      .addCase(logoutAllDevices.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      });

    // =========================================
    // FORGOT PASSWORD
    // =========================================

    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = false;
      })

      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.message = action.payload.message;

        state.error = null;
      })

      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload;
      });

    // =========================================
    // RESET PASSWORD
    // =========================================

    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = false;
      })

      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.message = action.payload.message;

        state.error = null;
      })

      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload;
      });
  },
});

export const { clearAuthError, clearAuthSuccess, setAccessToken, logoutLocal } =
  authSlice.actions;

export default authSlice.reducer;
