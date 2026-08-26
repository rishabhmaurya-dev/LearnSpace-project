import api from "../../services/axios";

// Register
export const registerApi = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Login
export const loginApi = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Refresh access token
export const refreshApi = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};

// Logout
export const logoutApi = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

// Logout all devices
export const logoutAllApi = async () => {
  const response = await api.post("/auth/logout-all");
  return response.data;
};

// Forgot password
export const forgotPasswordApi = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

// Reset password
export const resetPasswordApi = async ({ token, newPassword }) => {
  const response = await api.post(`/auth/reset-password/${token}`, {
    newPassword,
  });

  return response.data;
};
