import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let storeInstance = null;

export const setupAxiosInterceptors = (store) => {
  storeInstance = store;

  // request interceptor

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

  // refresh management: keep isRefreshing true until all queued requests are retried

  let isRefreshing = false;
  let refreshSubscribers = [];

  const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
  };

  const onRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];

    // Only now mark refresh as done — all queued
    // requests have been dispatched with the new token.
    isRefreshing = false;
  };

  // response interceptor

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

      // refresh already running — queue this request and retry after new token

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            api(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      // start refresh

      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");

        const newToken = response.data.accessToken;

        storeInstance.dispatch({
          type: "auth/setAccessToken",
          payload: newToken,
        });

        // Retry all queued requests, then clear flag
        onRefreshed(newToken);

        // Retry the original request that triggered this
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        refreshSubscribers = [];

        storeInstance.dispatch({
          type: "auth/logoutLocal",
        });

        return Promise.reject(refreshError);
      }
    },
  );
};

export default api;