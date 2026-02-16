import { useEffect, useState } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import VisitorChart from '../components/VisitorChart';
import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    CheckCircle,
    Shield,
    Search,
    Filter,
    MoreVertical,
    Clock,
    MapPin,
    Phone,
    Mail,
    Trash2,
    Plus,
    Camera,
    X,
    TrendingUp,
    TrendingDown,
    User
} from 'lucide-react';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <motion.div
        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color.text}`}>
            <Icon className="w-24 h-24 transform translate-x-8 -translate-y-8" />
        </div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{trendValue}</span>
                </div>
            )}
        </div>

        <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        </div>
    </motion.div>
);



const StaffManagement = ({ onUpdate }) => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        designation: '',
        role: 'security',
        photo: null
    });
    const [preview, setPreview] = useState(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchSecurityUsers();
    }, []);

    const fetchSecurityUsers = async () => {
        try {
            const res = await api.get('/admin/security-users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photo: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('phone', formData.phone);
        data.append('designation', formData.designation);
        data.append('role', formData.role);
        if (formData.photo) {
            data.append('photo', formData.photo);
        }

        try {
            await api.post('/admin/create-security', data);
            setMsg('Staff member added successfully');
            setFormData({
                name: '', email: '', password: '', phone: '', designation: '', role: 'security', photo: null
            });
            setPreview(null);
            fetchSecurityUsers();
            if (onUpdate) onUpdate();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Error adding user');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (user) => {
        setDeleteModal({ show: true, id: user._id, name: user.name });
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.id) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/admin/user/${deleteModal.id}`);
            fetchSecurityUsers();
            if (onUpdate) onUpdate();
            setMsg('Staff member removed successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg('Error deleting user');
            setTimeout(() => setMsg(''), 3000);
        } finally {
            setDeleteLoading(false);
            setDeleteModal({ show: false, id: null, name: '' });
        }
    };

    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http')) return photoPath;
        const BASE_URL = 'http://localhost:5000';
        return `${BASE_URL}/${photoPath.replace(/\\/g, '/')}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    Security & Staff Management
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                {/* Staff List */}
                <div className="lg:col-span-7 p-6">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Active Personnel</h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {users.map(user => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
                                    {user.photo ? (
                                        <img src={getPhotoUrl(user.photo)} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 ml-4 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 truncate text-sm">{user.name}</h4>
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                                {user.role !== 'admin' && ( // Prevent deleting admins for now or add logic
                                    <button
                                        onClick={() => confirmDelete(user)}
                                        className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                        {users.length === 0 && <p className="text-slate-400 text-center py-8 text-sm italic">No staff members found.</p>}
                    </div>
                </div>

                {/* Add Form */}
                <div className="lg:col-span-5 p-6 bg-slate-50/30">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add New Staff
                    </h3>

                    {msg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`p-3 mb-4 rounded-lg text-xs font-medium border ${msg.includes('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                        >
                            {msg}
                        </motion.div>
                    )}

                    <form onSubmit={handleAddUser} className="space-y-3">
                        <div className="flex justify-center mb-4">
                            <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 hover:border-indigo-500 transition-colors cursor-pointer group shadow-sm">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <Camera className="w-6 h-6 mx-auto mb-1" />
                                        <span className="text-[9px] font-bold uppercase">Upload</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                >
                                    <option value="security">Security</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                            <input
                                type="text"
                                name="designation"
                                placeholder="Designation (Optional)"
                                value={formData.designation}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 font-bold text-sm shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                            {loading ? 'Creating...' : 'Create Staff Profile'}
                        </button>
                    </form>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, id: null, name: '' })}
                onConfirm={handleDeleteUser}
                title="Confirm Removal"
                message="Are you sure you want to remove this staff member? This action relies on the backend implementation."
                confirmText="Yes, Remove"
                confirmColor="bg-red-600 hover:bg-red-700"
                loading={deleteLoading}
            >
                {deleteModal.name && <div className="mt-2 font-bold text-slate-800 text-center bg-slate-50 py-2 rounded">{deleteModal.name}</div>}
            </ConfirmModal>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalVisitorsToday: 0,
        activePasses: 0,
        completedVisits: 0,
        totalSecurityStaff: 0,
    });
    useEffect(() => {
        const fetchData = async () => {
            await fetchStats();
            setLoading(false);
        };

        fetchData();

        const interval = setInterval(() => {
            fetchStats();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };





    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-[1600px] mx-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <a
                    href="/admin/audit-logs"
                    className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-semibold flex items-center gap-2 group"
                >
                    <div className="p-1 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Shield className="w-4 h-4 text-indigo-600" />
                    </div>
                    View Audit Logs
                </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Visitors Today"
                    value={stats.totalVisitorsToday}
                    icon={Users}
                    color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                    trend="up"
                    trendValue="12%"
                />
                <StatCard
                    title="Active Passes"
                    value={stats.activePasses}
                    icon={UserCheck}
                    color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
                    trend="up"
                    trendValue="5%"
                />
                <StatCard
                    title="Completed Visits"
                    value={stats.completedVisits}
                    icon={CheckCircle}
                    color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
                />
                <StatCard
                    title="Security Staff"
                    value={stats.totalSecurityStaff}
                    icon={Shield}
                    color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
                />
            </div>

            {/* Layout: Chart + Visitors */}
            <div className="grid grid-cols-1 gap-8 mb-8">
                {/* Full Width: Chart & Staff */}
                <div className="space-y-8">
                    {/* Analytics */}
                    <div className="h-[400px]">
                        <VisitorChart />
                    </div>

                    {/* Staff Management */}
                    <StaffManagement onUpdate={fetchStats} />
                </div>

                {/* Right Col: Recent Visitors - Removed or Replaced with something else? 
                    User asked to "Remove Recent Visitors from AdminDashboard.jsx".
                    I will remove the entire column or just the content? 
                    The grid is 3 columns. If I remove the right column, the left column should probably span full width or I should adjust the grid.
                    Let's adjust the grid to be 1 column or 2 columns if consistent.
                    Actually, if I remove the right column, the layout might look empty.
                    I'll change the grid to `grid-cols-1` effectively or just remove the column and let the left column take full width if I change its col-span.
                 */}
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
