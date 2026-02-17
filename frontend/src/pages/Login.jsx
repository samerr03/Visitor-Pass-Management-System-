import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import logo from '../assets/logo-dark.svg'; // Import ZenZ Logo

const Login = ({ role }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Get role from props OR URL query params
    const [searchParams] = useSearchParams();
    const roleParam = role || searchParams.get('role'); // 'admin' or 'security'

    if (!roleParam) {
        return <Navigate to="/" replace />;
    }

    const { login, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logout(false);
    }, [roleParam]);

    const getTitle = () => {
        if (roleParam === 'admin') return 'Admin Portal';
        if (roleParam === 'security') return 'Security Access';
        return 'Welcome Back';
    };

    const getRoleColor = () => {
        if (roleParam === 'admin') return 'blue';
        if (roleParam === 'security') return 'emerald';
        return 'purple';
    };

    const roleColor = getRoleColor();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(email, password);

            if (roleParam && user.role !== roleParam) {
                logout();
                setError(`Access Denied: You cannot login as ${user.role} here.`);
                setIsLoading(false);
                return;
            }

            if (user.role === 'admin') navigate('/admin', { replace: true });
            else if (user.role === 'security') navigate('/security', { replace: true });
            else {
                setError('Unauthorized access: Unknown role');
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden font-sans bg-[#0B0F19]">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Background Image - Modern Corporate Office */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 scale-105 pointer-events-none"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2301')" }}
                ></div>

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/95 via-[#1e1b4b]/80 to-[#0f172a]/95"></div>

                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

                {/* Animated Orbs (Subtle) */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen"
                ></motion.div>

                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px] mix-blend-screen"
                ></motion.div>

                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[380px] px-4"
            >
                {/* Premium Glass Card */}
                <div className="bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-8 relative overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] hover:border-white/[0.15] transition-all duration-500">

                    {/* Top Shine Effect */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50"></div>
                    {/* Role Indicator Stripe */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${roleParam === 'admin' ? 'from-blue-500 via-cyan-500 to-blue-600' : roleParam === 'security' ? 'from-emerald-500 via-teal-500 to-emerald-600' : 'from-indigo-500 via-purple-500 to-pink-500'} opacity-80`}></div>

                    {/* Branding Header */}
                    <div className="text-center mb-6 flex flex-col items-center">
                        {/* Secure Access Badge */}
                        <div className="mb-4 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 shadow-inner flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${roleParam === 'admin' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : roleParam === 'security' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]'}`}></div>
                            Secure Access
                        </div>

                        {/* Logo */}
                        <motion.img
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            src={logo}
                            alt="ZenZ Systems"
                            className="w-36 mb-2 drop-shadow-lg"
                        />

                        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1 drop-shadow-md">
                            {getTitle()}
                        </h1>
                        <p className="text-slate-400 text-xs font-medium tracking-wide">
                            {roleParam ? `Please login to continue as ${roleParam}` : 'Sign in to access your dashboard'}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 backdrop-blur-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-red-200 font-medium">{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 ml-1 tracking-widest uppercase">Email Address</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-slate-500'}`}>
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 text-white placeholder-slate-500 transition-all text-sm backdrop-blur-sm shadow-inner"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 ml-1 tracking-widest uppercase">Password</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'password' ? 'text-white' : 'text-slate-500'}`}>
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full pl-10 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 text-white placeholder-slate-500 transition-all text-sm backdrop-blur-sm shadow-inner"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg className="h-4 w-4 text-slate-500 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4 text-slate-500 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className={`w-3.5 h-3.5 border border-white/30 rounded bg-white/5 peer-checked:bg-${roleColor}-500 peer-checked:border-${roleColor}-500 transition-all`}></div>
                                    <svg className="absolute top-0.5 left-0.5 w-2.5 h-2.5 text-white hidden peer-checked:block pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-slate-400 group-hover:text-slate-300 transition-colors text-xs">Remember me</span>
                            </label>
                            <a href="#" className={`text-xs font-medium text-${roleColor}-400 hover:text-${roleColor}-300 hover:underline decoration-2 underline-offset-4 transition-all`}>Forgot password?</a>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02, brightness: 1.1 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full relative overflow-hidden group py-3 px-4 rounded-xl shadow-xl text-sm font-bold text-white uppercase tracking-wider
                                ${roleParam === 'admin' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25' :
                                    roleParam === 'security' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25' :
                                        'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-purple-500/30'
                                }
                            `}
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 -translate-x-full"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </span>
                        </motion.button>
                    </form>

                    {/* Role Hints */}
                    {!roleParam && (
                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-center gap-4 text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                            <span>Login as:</span>
                            <span className="text-blue-400">Admin</span>
                            <span className="text-emerald-400">Security</span>
                            <span className="text-purple-400">Staff</span>
                        </div>
                    )}

                    {/* Demo Mode Quick Access */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Safe Demo Mode</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail('demo_admin@demo.com');
                                    setPassword('demo_password');
                                }}
                                className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all text-xs text-blue-300 font-medium flex flex-col items-center gap-1 group"
                            >
                                <span className="uppercase tracking-wider text-[9px] opacity-70 group-hover:opacity-100">Admin Demo</span>
                                <span className="font-bold text-white">Auto-Fill</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail('demo_security@demo.com');
                                    setPassword('demo_password');
                                }}
                                className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-xs text-emerald-300 font-medium flex flex-col items-center gap-1 group"
                            >
                                <span className="uppercase tracking-wider text-[9px] opacity-70 group-hover:opacity-100">Security Demo</span>
                                <span className="font-bold text-white">Auto-Fill</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 font-medium tracking-wide">
                        &copy; 2026 <span className="text-slate-300 font-bold">ZenZ</span> — Secure Visitor Management
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
