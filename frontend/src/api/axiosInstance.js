import axios from "axios";
import { store } from "../redux/store";
import { setAccessToken, forceLogout } from "../redux/slices/authSlice";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// 1. Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Response Interceptor (FIXED)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log(originalRequest);
    // 🛑 CRITICAL GUARD: Auth Routes (Login, Register, Refresh) par Silent Refresh RUN NAHI hona chahiye
    const isAuthRoute =
      originalRequest.url?.includes("auth/login") ||
      originalRequest.url?.includes("auth/register") ||
      originalRequest.url?.includes("auth/refresh");

    // Agar 401 Unauthorized hai aur request Auth Route ki NAHI hai
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await API.post(
          "/auth/refresh",
          {},
          { withCredentials: true },
        );

        const newAccessToken = refreshResponse.data.accessToken;

        store.dispatch(setAccessToken(newAccessToken));

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        store.dispatch(forceLogout());
        return Promise.reject(refreshError);
      }
    }

    // Auth Routes ke case me direct original error pass hone de (e.g., "Invalid password")
    return Promise.reject(error);
  },
);

export default API;
