import axios from "axios";

// Vite env (production build time). Example value:
// VITE_API_BASE_URL=http://54.210.114.254:5000/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Optional safety: if env missing, throw early instead of silently using localhost
if (!BASE_URL) {
    console.error("VITE_API_BASE_URL is missing. Check frontend/.env.production");
}

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const url = originalRequest?.url || "";
        const isAuthEndpoint =
            url.includes("/auth/login") ||
            url.includes("/auth/logout") ||
            url.includes("/auth/refresh");

        if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            try {
                const res = await api.post("/auth/refresh");
                if (res.status === 200 && res.data?.token) {
                    localStorage.setItem("token", res.data.token);
                    api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
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