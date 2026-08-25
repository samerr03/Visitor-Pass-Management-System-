import axios from "axios";

// In local dev: use "/api" + Vite proxy
// In production: keep "/api" only if your hosting rewrites /api -> backend
// Or set full URL in env: https://backend.com/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// If you want to enforce env only in production builds:
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
    console.warn(
        "VITE_API_BASE_URL is missing in production build. Using '/api'. Make sure your hosting rewrites /api to backend."
    );
}

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Attach token on every request (if you use Bearer tokens)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        const contentType = response.headers?.["content-type"];
        if (contentType && contentType.includes("text/html")) {
            return Promise.reject(
                new Error(
                    "API reached a frontend HTML page (possible CloudFront fallback). Check /api routing (rewrites/behaviors) or API base URL."
                )
            );
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config || {};
        const url = originalRequest?.url || "";

        const isAuthEndpoint =
            url.includes("/auth/login") ||
            url.includes("/auth/logout") ||
            url.includes("/auth/refresh-token");

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            originalRequest._retry = true;
            try {
                const res = await api.post("/auth/refresh-token");
                const newToken = res.data?.token;

                if (res.status === 200 && newToken) {
                    localStorage.setItem("token", newToken);
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (err) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;