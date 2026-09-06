import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let storeInstance = null;

export const setupAxiosInterceptors = (store) => {
  storeInstance = store;

  // =========================================
  // REQUEST INTERCEPTOR
  // =========================================

  api.interceptors.request.use(
    (config) => {
      const token = storeInstance.getState().auth.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // =========================================
  // REFRESH MANAGEMENT
  // =========================================

  let isRefreshing = false;
  let refreshSubscribers = [];

  const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
  };

  const onRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
  };

  // =========================================
  // RESPONSE INTERCEPTOR
  // =========================================

  api.interceptors.response.use(
    (response) => response,

    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status !== 401 ||
        originalRequest?._retry ||
        originalRequest?.url?.includes("/auth/login") ||
        originalRequest?.url?.includes("/auth/register") ||
        originalRequest?.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // =====================================
      // REFRESH ALREADY RUNNING
      // =====================================

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            api(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      // =====================================
      // START REFRESH
      // =====================================

      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");

        const newToken = response.data.accessToken;

        storeInstance.dispatch({
          type: "auth/setAccessToken",
          payload: newToken,
        });

        onRefreshed(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        storeInstance.dispatch({
          type: "auth/logoutLocal",
        });

        refreshSubscribers = [];

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

export default api;
