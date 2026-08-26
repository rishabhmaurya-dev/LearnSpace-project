import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  registerApi,
  loginApi,
  refreshApi,
  logoutApi,
  logoutAllApi,
  forgotPasswordApi,
  resetPasswordApi,
} from "./authApi";

// REGISTER
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await registerApi(userData);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginApi(credentials);

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

// REFRESH
export const refreshUser = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await refreshApi();
      console.log("✅ REFRESH RESPONSE:", data);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Session expired",
      );
    }
  },
);

// LOGOUT
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await logoutApi();

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

// LOGOUT ALL
export const logoutAllDevices = createAsyncThunk(
  "auth/logoutAllDevices",
  async (_, { rejectWithValue }) => {
    try {
      const data = await logoutAllApi();

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout all failed",
      );
    }
  },
);

// FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const data = await forgotPasswordApi(email);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to send reset link",
      );
    }
  },
);

// RESET PASSWORD
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const data = await resetPasswordApi({
        token,
        newPassword,
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed",
      );
    }
  },
);
