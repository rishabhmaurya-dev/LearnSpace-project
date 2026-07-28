import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axiosInstance";
// ------------------------------------------------------------------
// 🚀 ALL 7 AUTH ASYNC THUNKS
// ------------------------------------------------------------------

// 1. REGISTER USER (Auto-Login included)
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      if (formData.role?.toUpperCase() === "ADMIN") {
        return rejectWithValue("Public registration for Admin is restricted.");
      }

      await API.post("auth/register", formData);

      // Registration success hone par direct login call karte hain
      return await dispatch(
        loginUser({ email: formData.email, password: formData.password }),
      ).unwrap();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  },
);

// 2. LOGIN USER
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await API.post("auth/login", credentials);
      return response.data; // Expected: { accessToken, user }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid email or password.",
      );
    }
  },
);

// 3. SILENT REFRESH / CHECK SESSION (Page Reload / Restore Session)
export const checkAuthSession = createAsyncThunk(
  "auth/checkAuthSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.post("auth/refresh");
      return response.data; // Expected: { accessToken, user }
    } catch (error) {
      return rejectWithValue("Session expired. Please log in again.");
    }
  },
);

// 4. FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await API.post("auth/forgot-password", emailData);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send password reset email.",
      );
    }
  },
);

// 5. RESET PASSWORD WITH TOKEN
export const resetPasswordWithToken = createAsyncThunk(
  "auth/resetPasswordWithToken",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await API.post(`auth/reset-password/${token}`, {
        newPassword,
      });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Password reset failed. Token might be invalid or expired.",
      );
    }
  },
);

// 6. LOGOUT (SINGLE DEVICE)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (accessToken, { rejectWithValue }) => {
    try {
      const response = await API.post(
        "auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed.");
    }
  },
);

// 7. LOGOUT ALL DEVICES (TOKEN VERSION INCREMENT)
export const logoutAllDevices = createAsyncThunk(
  "auth/logoutAllDevices",
  async (accessToken, { rejectWithValue }) => {
    try {
      const response = await API.post(
        "auth/logout-all",
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout from all devices failed.",
      );
    }
  },
);

// ------------------------------------------------------------------
// 📦 AUTH SLICE INITIAL STATE
// ------------------------------------------------------------------

const initialState = {
  user: null,
  accessToken: null, // Strictly in Redux RAM Memory
  isAuthenticated: false,
  isInitializing: true, // App initial session loader
  isLoading: false,
  error: null,
  successMessage: null,
};

// ------------------------------------------------------------------
// ⚙️ AUTH SLICE REDUCERS & EXTRA REDUCERS
// ------------------------------------------------------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    clearAuthStates: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    forceLogout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==========================================
      // 1. REGISTER USER
      // ==========================================
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.successMessage = "Account created & logged in successfully!";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==========================================
      // 2. LOGIN USER
      // ==========================================
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.successMessage = "Logged in successfully!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==========================================
      // 3. SILENT REFRESH / CHECK SESSION
      // ==========================================
      .addCase(checkAuthSession.pending, (state) => {
        state.isInitializing = true;
        state.error = null;
      })
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(checkAuthSession.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })

      // ==========================================
      // 4. FORGOT PASSWORD
      // ==========================================
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==========================================
      // 5. RESET PASSWORD WITH TOKEN
      // ==========================================
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetPasswordWithToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==========================================
      // 6. LOGOUT (SINGLE DEVICE)
      // ==========================================
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.successMessage = action.payload;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==========================================
      // 7. LOGOUT ALL DEVICES
      // ==========================================
      .addCase(logoutAllDevices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutAllDevices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.successMessage = action.payload;
      })
      .addCase(logoutAllDevices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setAccessToken, clearAuthStates, forceLogout } =
  authSlice.actions;
export default authSlice.reducer;
