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
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        if (shouldRedirect) {
            navigate('/', { replace: true });
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
