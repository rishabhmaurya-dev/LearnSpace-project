import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPublicCoursesApi } from "./publicApi";

export const fetchPublicCourses = createAsyncThunk(
  "public/fetchPublicCourses",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getPublicCoursesApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses",
      );
    }
  },
);
