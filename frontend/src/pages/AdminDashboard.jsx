import { useEffect, useState } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

// Sub-components defined outside to prevent re-rendering issues
const StatCard = ({ title, value, color }) => (
    <div className={`bg-white p-6 rounded shadow-md border-l-4 ${color}`}>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
);

const VisitorCard = ({ visitor }) => {
    const isActive = visitor.status === 'active';

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all hover:shadow-lg ${isActive ? 'border-green-500' : 'border-gray-400'
            }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{visitor.name}</h3>
                    <p className="text-sm text-gray-600">{visitor.phone}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {isActive ? 'Active' : 'Completed'}
                </span>
            </div>

            <div className="space-y-2 text-sm">
                <div>
                    <span className="text-gray-500">Purpose:</span>
                    <span className="ml-2 text-gray-800">{visitor.purpose}</span>
                </div>
                <div>
                    <span className="text-gray-500">Meeting:</span>
                    <span className="ml-2 text-gray-800">{visitor.personToMeet}</span>
                </div>
                <div>
                    <span className="text-gray-500">Entry:</span>
                    <span className="ml-2 text-gray-800">{formatDateTime(visitor.entryTime)}</span>
                </div>
                {visitor.exitTime && (
                    <div>
                        <span className="text-gray-500">Exit:</span>
                        <span className="ml-2 text-gray-800">{formatDateTime(visitor.exitTime)}</span>
                    </div>
                )}
                <div>
                    <span className="text-gray-500">Card Generated:</span>
                    <span className={`ml-2 font-medium ${visitor.cardGenerated ? 'text-green-600' : 'text-red-600'}`}>
                        {visitor.cardGenerated ? 'Yes' : 'No'}
                    </span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                    Pass ID: {visitor.passId}
                </div>
            </div>
        </div>
    );
};

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
            setMsg('Staff member removed successfully'); // This msg is in the add form, serves as general toast for the component for now
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg('Error deleting user');
            setTimeout(() => setMsg(''), 3000);
        } finally {
            setDeleteLoading(false);
            setDeleteModal({ show: false, id: null, name: '' });
        }
    };

    // Helper to get photo URL
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http')) return photoPath;
        const BASE_URL = 'http://localhost:5000';
        return `${BASE_URL}/${photoPath.replace(/\\/g, '/')}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">All Staff Members</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {users.map(user => (
                            <div key={user._id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 gap-3 hover:bg-white hover:shadow-sm transition-all">
                                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                    {user.photo ? (
                                        <img
                                            src={getPhotoUrl(user.photo)}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-slate-100">${user.name.charAt(0)}</div>`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-slate-100">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 truncate">{user.name}</h4>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">{user.staffId || 'ID Pending'}</p>
                                </div>
                                <button
                                    onClick={() => confirmDelete(user)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full"
                                    title="Remove Staff"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                        {users.length === 0 && <p className="text-gray-400 text-center py-4">No staff members found.</p>}
                    </div>
                </div>

                {/* Add Form */}
                <div>
                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Staff</h3>
                        {msg && <div className={`p-3 mb-4 rounded text-sm font-medium ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}

                        <form onSubmit={handleAddUser} className="space-y-4">

                            {/* Photo Upload */}
                            <div className="flex justify-center mb-4">
                                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer group">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2 text-gray-400 group-hover:text-blue-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            </svg>
                                            <span className="text-[10px]">Photo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name*"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address*"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="designation"
                                    placeholder="Designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="security">Security</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <input
                                type="password"
                                name="password"
                                placeholder="Create Password*"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />

                            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 font-semibold shadow disabled:opacity-50 transition-colors">
                                {loading ? 'Creating Staff Profile...' : 'Create Staff Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, id: null, name: '' })}
                onConfirm={handleDeleteUser}
                title="Confirm Deletion"
                message="Are you sure you want to remove this staff member? This action cannot be undone."
                confirmText="Yes, Remove"
                confirmColor="bg-red-600 hover:bg-red-700"
                loading={deleteLoading}
            >
                {deleteModal.name && (
                    <div className="bg-red-50 p-3 rounded border border-red-100 mt-2">
                        <span className="text-gray-500 text-sm">Staff Name:</span>
                        <div className="font-bold text-gray-800">{deleteModal.name}</div>
                    </div>
                )}
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
    const [visitors, setVisitors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchStats();
        fetchVisitors();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchStats(); // Refresh stats too
            fetchVisitors();
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

    const fetchVisitors = async () => {
        try {
            const res = await api.get('/visitors');
            setVisitors(res.data);
        } catch (err) {
            console.error('Error fetching visitors:', err);
        }
    };

    const filteredVisitors = visitors.filter(visitor => {
        const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visitor.phone.includes(searchTerm);
        const matchesFilter = filterStatus === 'all' || visitor.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <a
                    href="/admin/audit-logs"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    View Audit Logs
                </a>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Visitors Today" value={stats.totalVisitorsToday} color="border-blue-500" />
                <StatCard title="Active Passes" value={stats.activePasses} color="border-green-500" />
                <StatCard title="Completed Visits" value={stats.completedVisits} color="border-gray-500" />
                <StatCard title="Security Staff" value={stats.totalSecurityStaff} color="border-indigo-500" />
            </div>

            {/* Visitors Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Visitors</h2>
                    <div className="flex gap-4">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/* Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Visitor Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVisitors.length > 0 ? (
                        filteredVisitors.map((visitor) => (
                            <VisitorCard key={visitor._id} visitor={visitor} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No visitors found
                        </div>
                    )}
                </div>
            </div>

            {/* Security Management Section */}
            <StaffManagement onUpdate={fetchStats} />
        </div>
    );
};

export default AdminDashboard;
