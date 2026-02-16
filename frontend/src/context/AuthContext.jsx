import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(false); // Start false since we check localStorage synchronously

    useEffect(() => {
        // Optional: Verify token with backend here if needed
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    };

    const navigate = useNavigate();

    const logout = async (shouldRedirect = true) => {
        // Handle event object or boolean
        const redirect = typeof shouldRedirect === 'boolean' ? shouldRedirect : true;

        // Try to get role from state, or fallback to localStorage if state is stale/null
        let role = user?.role;
        if (!role) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    role = parsed.role;
                    console.log("Recovered role from localStorage:", role);
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                }
            }
        }

        // Normalize role
        const normalizedRole = role ? role.toLowerCase() : null;
        console.log("Logout triggered. Role:", normalizedRole);

        // Perform Redirect FIRST to avoid ProtectedRoute race condition
        // (ProtectedRoute redirects to '/' if user becomes null)
        if (redirect) {
            if (normalizedRole === 'admin') {
                console.log("Redirecting to /admin/login");
                navigate('/admin/login', { replace: true });
            } else if (normalizedRole === 'security') {
                console.log("Redirecting to /security/login");
                navigate('/security/login', { replace: true });
            } else {
                console.log("Redirecting to / (fallback)");
                navigate('/', { replace: true });
            }
        }

        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error(err);
        }

        // Clear all auth data AFTER navigation logic initiated
        // Note: The destination page (Login.jsx) also calls logout(false) to ensure cleanup
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            api.defaults.headers.common['Authorization'] = null;
        }, 100);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
