// Shared Axios client for consistent API and auth handling.

import axios from "axios";

/**
 * Axios instance with unified base URL and auth headers.
 */
// const rawBaseUrl = import.meta.env.VITE_URL || "http://localhost:8000";
// const normalizedBaseUrl = rawBaseUrl
//   .replace(/\/+$|\/api$/i, "")
//   .replace(/\/+$/, "") || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_URL || "http://localhost:8000",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("accessToken");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   },
// );
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Identify if this request was to the verification endpoint
    const isVerifyRequest = error.config?.url?.includes("/api/v1/auth/verify");

    // 2. Only redirect to login if it's a 401 AND NOT the verification page
    if (error.response?.status === 401 && !isVerifyRequest) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    // 3. Always reject so the .catch() in VerifyEmail.jsx can catch it
    return Promise.reject(error);
  }
);
