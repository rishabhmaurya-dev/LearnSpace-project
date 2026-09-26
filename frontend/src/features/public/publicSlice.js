import { createSlice } from "@reduxjs/toolkit";
import { fetchPublicCourses } from "./publicThunks";

const initialState = {
  courses: [],
  categories: [],
  total: 0,
  loading: false,
  error: null,
};

const publicSlice = createSlice({
  name: "public",
  initialState,
  reducers: {
    clearPublicCoursesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || [];
        state.categories = action.payload.categories || [];
        state.total = action.payload.total ?? 0;
        state.error = null;
      })
      .addCase(fetchPublicCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch courses";
      });
  },
});

export const { clearPublicCoursesError } = publicSlice.actions;

export default publicSlice.reducer;
