import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    Phone,
    FileText,
    Users,
    Clock,
    Calendar,
    ShieldCheck,
    ArrowLeft,
    Loader2
} from 'lucide-react';

const VerifyPass = () => {
    const { passId } = useParams();
    const navigate = useNavigate();

    // Auth context could be checked here to conditionally show "Check-In" button,
    // assuming it runs via useAuth().
    // We'll simulate fetching current user role cautiously.
    const [userRole, setUserRole] = useState(null);
    const [visitor, setVisitor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    // Fetch user manually to decouple from heavy contexts, or gracefully fail if public
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data && res.data.user) {
                    setUserRole(res.data.user.role);
                }
            } catch (err) {
                // Not logged in or error, perfectly fine for public verify
                setUserRole(null);
            }
        };
        checkAuth();
    }, []);

    const fetchPassDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/passes/${passId}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            setVisitor(res.data);
        } catch (err) {
            console.error(err);
            if (err.response) {
                if (err.response.status === 404) {
                    setError('INVALID_PASS');
                } else if (err.response.status === 400) {
                    setError('INVALID_QR');
                } else {
                    setError('SERVER_ERROR');
                }
            } else {
                setError('SERVER_ERROR');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (passId) {
            fetchPassDetails();
        }
    }, [passId]);

    const handleCheckIn = async () => {
        setActionLoading(true);
        setMsg(null);
        try {
            const res = await api.patch(`/passes/${passId}/status`, { status: "USED" });
            setMsg({ type: 'success', text: 'Check-in successful.' });
            setVisitor(res.data.visitor);
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: err.response?.data?.message || 'Error occurred.' });
        } finally {
            setActionLoading(false);
        }
    };

    // Helper functions
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        let filename = photoPath.replace(/\\/g, "/");
        if (filename.includes("uploads/")) {
            filename = filename.split("uploads/").pop();
        }
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const HOST = API_BASE_URL.replace(/\/api\/?$/, "");
        return `${HOST}/uploads/${filename}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid" : date.toLocaleDateString();
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // UI Configuration
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Verifying Pass Details...</p>
            </div>
        );
    }

    if (error) {
        let title = "Error";
        let message = "An unknown error occurred.";

        switch (error) {
            case 'INVALID_PASS':
                title = "Invalid Pass";
                message = "This QR code is invalid or the pass has been deleted.";
                break;
            case 'INVALID_QR':
                title = "Invalid Format";
                message = "The scanned QR code format is not recognized or is malformed.";
                break;
            case 'SERVER_ERROR':
                title = "Connection Error";
                message = "Failed to communicate with the server. Please try again later.";
                break;
            default:
                title = "Verification Failed";
                message = error;
                break;
        }

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background overlay */}
                <div className="absolute top-0 inset-x-0 h-[250px] bg-gradient-to-b from-slate-200 to-transparent -z-10 opacity-50"></div>

                <div className="w-full max-w-sm flex justify-between items-center mb-6 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex flex-row items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium text-sm">Back to scanner</span>
                    </button>
                    {passId && (
                        <div className="text-slate-400 text-xs font-mono tracking-widest uppercase">ID: {passId.substring(0, 12)}{passId.length > 12 ? '...' : ''}</div>
                    )}
                </div>

                <div className="bg-white max-w-sm w-full p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center border-t-4 border-red-500 z-10">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50/50">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">{title}</h2>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 w-full mb-6 text-left">
                        <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
                    </div>

                    <div className="w-full space-y-3">
                        <button
                            onClick={() => {
                                // Either refresh to fetch again, or navigate to a scanner
                                // Since we are on a specific verify page, hitting back might be the scanner. 
                                // To follow the requirement: "Re-Scan (retry fetch or open scanner)"
                                navigate('/security');
                            }}
                            className="w-full py-3.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100 flex items-center justify-center gap-2"
                        >
                            Re-Scan
                        </button>
                        <button
                            onClick={() => navigate('/security')}
                            className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                        >
                            Return to Security Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!visitor) return null;

    const currentStatus = visitor.status || 'ACTIVE';
    const isSecurityOrAdmin = userRole === 'security' || userRole === 'admin';

    // Status mapping UI
    const statusConfig = {
        'ACTIVE': {
            bg: 'bg-emerald-500',
            lightBg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-700',
            icon: <CheckCircle className="w-4 h-4" />
        },
        'USED': {
            bg: 'bg-slate-500',
            lightBg: 'bg-slate-100',
            border: 'border-slate-200',
            text: 'text-slate-700',
            icon: <ShieldCheck className="w-4 h-4" />
        },
        'EXPIRED': {
            bg: 'bg-red-500',
            lightBg: 'bg-red-50',
            border: 'border-red-100',
            text: 'text-red-700',
            icon: <AlertCircle className="w-4 h-4" />
        }
    };

    const config = statusConfig[currentStatus] || statusConfig['ACTIVE'];

    return (
        <div className="min-h-screen bg-slate-50/80 py-10 px-4 flex flex-col items-center relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-indigo-900 via-slate-800 to-transparent -z-10"></div>

            {/* Nav */}
            <div className="w-full max-w-lg mb-6 flex justify-between items-center z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex flex-row items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium text-sm">Back</span>
                </button>
                <div className="text-white/50 text-xs font-mono tracking-widest uppercase">Verification Portal</div>
            </div>

            {/* Main Premium Card */}
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 z-10 transition-all duration-300">

                {/* Header Section */}
                <div className="p-8 pb-6 flex flex-col items-center text-center relative">
                    {/* Status Badge Top */}
                    <div className={`absolute top-0 inset-x-0 h-1.5 ${config.bg}`}></div>

                    {/* Photo */}
                    <div className="relative mb-5 group">
                        <div className={`w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 ring-4 ${currentStatus === 'ACTIVE' ? 'ring-emerald-500/20' : currentStatus === 'EXPIRED' ? 'ring-red-500/20' : 'ring-slate-500/20'} transition-all`}>
                            {getPhotoUrl(visitor.photo) ? (
                                <img
                                    src={getPhotoUrl(visitor.photo)}
                                    alt="Visitor"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${visitor.name}&background=0D8ABC&color=fff`; }}
                                />
                            ) : (
                                <User className="w-12 h-12 text-slate-300 m-auto mt-6" />
                            )}
                        </div>
                        {/* Status Chip */}
                        <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-4 py-1 flex items-center gap-1.5 rounded-full shadow-md border ${config.bg} text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap`}>
                            {config.icon} {currentStatus}
                        </div>
                    </div>

                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{visitor.name}</h1>
                    <div className="flex items-center gap-2 mt-1.5 justify-center">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono font-bold uppercase tracking-wider border border-slate-200">
                            {visitor.passId}
                        </span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="px-8 py-6 bg-slate-50/50 border-y border-slate-100">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Host</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{visitor.personToMeet}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Purpose</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800 truncate">{visitor.purpose}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Phone className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Contact</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{visitor.phone}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{formatDate(visitor.entryTime)}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Entry Time</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{formatTime(visitor.entryTime)}</p>
                        </div>

                        {visitor.exitTime && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Exit Time</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800">{formatTime(visitor.exitTime)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Section (Interactive) */}
                <div className="p-8 bg-white flex flex-col items-center">

                    {msg && (
                        <div className={`w-full mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {msg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                            {msg.text}
                        </div>
                    )}

                    {!isSecurityOrAdmin ? (
                        <div className={`w-full py-4 text-center rounded-xl border ${config.lightBg} ${config.border} ${config.text}`}>
                            <p className="text-sm font-semibold flex items-center justify-center gap-2">
                                {config.icon}
                                {currentStatus === 'ACTIVE'
                                    ? "Pass is valid. Show to security gate."
                                    : currentStatus === 'USED'
                                        ? "Pass has already been used."
                                        : "Pass is expired."}
                            </p>
                        </div>
                    ) : (
                        // Security Dashboard Actions
                        <div className="w-full">
                            {currentStatus === 'ACTIVE' && (
                                <button
                                    disabled={actionLoading}
                                    onClick={handleCheckIn}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                    {actionLoading ? 'Processing...' : 'Verify & Check-In'}
                                </button>
                            )}

                            {currentStatus === 'USED' && (
                                <div className="w-full py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Already Checked-In
                                </div>
                            )}

                            {currentStatus === 'EXPIRED' && (
                                <div className="w-full py-3.5 bg-red-50 border border-red-100 text-red-500 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                    <XCircle className="w-5 h-5" />
                                    Pass Expired
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-400 font-medium">Secured by Visitor Pass Management</p>
        </div>
    );
};

export default VerifyPass;
