import axios from "axios";

// Vite env (production build time). Example value:
// VITE_API_BASE_URL=http://34.229.147.51:5000/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Optional safety: if env missing, throw early instead of silently using localhost
if (!BASE_URL) {
    console.error("VITE_API_BASE_URL is missing. Check frontend/.env.production");
}

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => {
        // If the API returns HTML instead of JSON, reject it.
        // This prevents AWS CloudFront 404s (which return index.html as a 200 OK) from being parsed as success.
        const contentType = response.headers?.['content-type'];
        if (contentType && contentType.includes('text/html')) {
            return Promise.reject(new Error("API reached a frontend page (CloudFront 404 fallback). Check API URL config or CloudFront Behaviors."));
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        const url = originalRequest?.url || "";
        const isAuthEndpoint =
            url.includes("/auth/login") ||
            url.includes("/auth/logout") ||
            url.includes("/auth/refresh-token");

        if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            try {
                const res = await api.post("/auth/refresh-token");
                if (res.status === 200 && res.data?.token) {
                    localStorage.setItem("token", res.data.token);
                    api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
                    originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
                    return api(originalRequest);
                }
            } catch (err) {
                // 👇 DON'T hard redirect here; just reject
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;