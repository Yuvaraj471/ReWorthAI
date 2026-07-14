import axios from "axios";

// ---------- Axios Instance ----------
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ---------- Request Interceptor — inject JWT ----------
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("rw_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ---------- Response Interceptor — handle 401 ----------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear stale credentials and redirect to login
      localStorage.removeItem("rw_token");
      localStorage.removeItem("rw_refresh_token");
      localStorage.removeItem("rw_user");
      localStorage.removeItem("rw_is_auth");
      localStorage.removeItem("rw_is_admin");

      // Only redirect if not already on an auth page
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/register") && !path.startsWith("/admin/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------- Helper: check if backend is reachable ----------
export async function isBackendReachable(): Promise<boolean> {
  try {
    await api.get("/health", { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
