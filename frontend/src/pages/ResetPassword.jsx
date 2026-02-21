import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Lock, Loader2, KeyRound } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password });
            setMsg(res.data.message || 'Password successfully reset.');
            setSuccess(true);

            // Redirect based on role returned from backend if preferred,
            // or just back to public role selector after a few seconds.
            const roleRoute = res.data.role === 'admin' ? '/admin/login' : '/security/login';
            setTimeout(() => {
                navigate(roleRoute);
            }, 3500);

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-slate-900/[0.02] transform -skew-y-12 z-0"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Create New Password
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 max-w-sm mx-auto">
                    Please secure your account by entering a new password below.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">

                    {msg && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium animate-pulse">
                            {msg}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {!success ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
                                    New Password
                                </label>
                                <div className="mt-2 relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="new-password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl focus:ring-slate-500 focus:border-slate-500 text-sm transition-colors bg-slate-50/50 focus:bg-white"
                                        placeholder="Enter secure password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                                    Confirm Password
                                </label>
                                <div className="mt-2 relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl focus:ring-slate-500 focus:border-slate-500 text-sm transition-colors bg-slate-50/50 focus:bg-white"
                                        placeholder="Re-type new password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white shadow-lg focus:outline-none transition-all active:scale-[0.98] ${loading || !password || !confirmPassword
                                        ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-slate-900 hover:bg-black hover:shadow-slate-900/30'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2 flex-row">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </span>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-slate-500 mb-6">Redirecting you to the login dashboard...</p>
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
