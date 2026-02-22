import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // optional: token verify logic later
    }, []);

    // ✅ FIXED LOGIN
    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });

        // Most common backend response: { token, user }
        const token = res.data?.token;
        const userData = res.data?.user ?? res.data; // fallback if backend returns user directly

        if (token) {
            localStorage.setItem("token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            // If backend doesn't return token, remove any old token
            localStorage.removeItem("token");
            api.defaults.headers.common["Authorization"] = null;
        }

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return userData;
    };

    const navigate = useNavigate();

    const logout = async (shouldRedirect = true) => {
        const redirect = typeof shouldRedirect === "boolean" ? shouldRedirect : true;

        // role from state or localStorage
        let role = user?.role;
        if (!role) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    role = parsed?.role;
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                }
            }
        }

        const normalizedRole = role ? role.toLowerCase() : null;
        console.log("Logout triggered. Role:", normalizedRole);

        // Redirect first (your existing logic)
        if (redirect) {
            if (normalizedRole === "admin") navigate("/admin/login", { replace: true });
            else if (normalizedRole === "security") navigate("/security/login", { replace: true });
            else navigate("/", { replace: true });
        }

        // Call backend logout (safe even if fails)
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Logout API failed:", err);
        }

        // Clear local auth
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        api.defaults.headers.common["Authorization"] = null;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;