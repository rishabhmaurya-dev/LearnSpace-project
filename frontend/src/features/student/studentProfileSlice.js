import { createSlice } from "@reduxjs/toolkit";
import {
  fetchStudentProfile,
  updateStudentProfile,
  fetchStudentDashboard,
} from "./studentProfileThunks";

const initialState = {
  profile: null,
  dashboard: null,
  loading: false,
  updating: false,
  error: null,
  success: false,
  message: "",
};

const studentProfileSlice = createSlice({
  name: "studentProfile",
  initialState,
  reducers: {
    clearStudentProfileError: (state) => {
      state.error = null;
    },
    clearStudentProfileSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile || null;
        state.error = null;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch student profile";
      });

    builder
      .addCase(updateStudentProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload.profile || state.profile;
        state.success = true;
        state.message = action.payload.message || "Profile updated";
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.updating = false;
        state.success = false;
        state.error = action.payload || "Failed to update profile";
      });

    builder.addCase(fetchStudentDashboard.fulfilled, (state, action) => {
      state.dashboard = action.payload.dashboard || null;
    });
  },
});

export const { clearStudentProfileError, clearStudentProfileSuccess } =
  studentProfileSlice.actions;

export default studentProfileSlice.reducer;
