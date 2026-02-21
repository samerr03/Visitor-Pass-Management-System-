import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import loginBg from '../assets/login-bg.png';
import logo from '../assets/shield-logo.png';

const RoleSelection = () => {
    const navigate = useNavigate();

    const handleLogin = (role) => {
        navigate(`/login?role=${role}`);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 40,
                damping: 15,
            },
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans overflow-hidden relative bg-[#0B0F19]">

            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={loginBg}
                    alt="Corporate Office Background"
                    className="w-full h-full object-cover opacity-40 scale-105"
                />
                {/* Modern Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                {/* Radial Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            </div>

            {/* Decorative Overlay Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col items-center justify-center py-8 px-4 relative z-10 w-full max-w-7xl mx-auto">

                {/* Branding Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-6 text-center flex flex-col items-center"
                >
                    <img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        src={logo}
                        alt="System Logo"
                        className="w-56 md:w-72 -mt-6 mb-1 drop-shadow-2xl"
                    />

                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg font-display mb-6">
                        Visitor Management System
                    </h1>

                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6"></div>

                    <p className="text-lg text-white/80 font-medium tracking-wide max-w-lg mx-auto leading-relaxed">
                        Secure. Smart. Seamless Access Control.
                    </p>
                </motion.div>

                {/* Cards Container */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16"
                >

                    {/* Admin Card */}
                    <motion.div
                        variants={cardVariants}
                        className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex flex-col h-full overflow-hidden group relative hover:border-white/20 hover:translate-y-1 transition-all duration-300"
                    >
                        {/* Top Accent Border */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>

                        <div className="p-8 md:p-10 flex-grow flex flex-col items-center text-center relative z-10">
                            {/* Icon Glow */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500"></div>

                            <motion.div
                                className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 relative z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </motion.div>

                            <h3 className="text-xl font-bold text-white mt-4 mb-3 group-hover:text-blue-400 transition-colors">Admin Portal</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8 px-4">
                                Complete control over logs, staff records, and system analytics.
                            </p>

                            <button
                                onClick={() => handleLogin('admin')}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98] relative overflow-hidden group/btn"
                            >
                                <span className="relative z-10">Login as Admin</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                                {/* Button Shine */}
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                            </button>
                        </div>
                    </motion.div>

                    {/* Security Card */}
                    <motion.div
                        variants={cardVariants}
                        className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex flex-col h-full overflow-hidden group relative hover:border-white/20 hover:translate-y-1 transition-all duration-300"
                    >
                        {/* Top Accent Border */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>

                        <div className="p-8 md:p-10 flex-grow flex flex-col items-center text-center relative z-10">
                            {/* Icon Glow */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all duration-500"></div>

                            <motion.div
                                className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20 relative z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </motion.div>

                            <h3 className="text-xl font-bold text-white mt-4 mb-3 group-hover:text-emerald-400 transition-colors">Security Access</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8 px-4">
                                Fast-track visitor entry, pass generation, and identity verification.
                            </p>

                            <button
                                onClick={() => handleLogin('security')}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98] relative overflow-hidden group/btn"
                            >
                                <span className="relative z-10">Login as Security</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                                {/* Button Shine */}
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                            </button>
                        </div>
                    </motion.div>

                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 w-full max-w-4xl text-center"
                >
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-300">Real-time Tracking</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883-.393 1.627-1 2.131m-1.5 2.131a4 4 0 004.999 0m3.758-2.131C9.853 7.127 10 6.602 10 5.867 10 5.488 10.33 4.867 10.867 4.867h2.232c.537 0 .867.621.867 1s-.147 1.26-.535 2.131"></path></svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-300">Staff ID Management</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-300">QR & Barcode Access</span>
                    </div>
                </motion.div>

            </div>

            {/* Footer */}
            <div className="relative z-10 w-full text-center pb-6">
                <div className="w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>
                <p className="text-xs text-slate-500 font-medium tracking-wide">
                    &copy; 2026 <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">VMS</span> — Secure Visitor Management
                </p>
            </div>
        </div>
    );
};

export default RoleSelection;
