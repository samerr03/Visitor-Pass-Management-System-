import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    User,
    Phone,
    Clock,
    MapPin,
    FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminVisitors = () => {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVisitors, setTotalVisitors] = useState(0);

    useEffect(() => {
        fetchVisitors();
    }, [page]);

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/visitors?page=${page}&limit=10`);
            setVisitors(res.data.visitors);
            setTotalPages(res.data.pages);
            setTotalVisitors(res.data.total);
        } catch (err) {
            console.error('Error fetching visitors:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            // Fetch all visitors for export
            const res = await api.get('/admin/visitors?limit=all');
            const allVisitors = res.data.visitors;

            // Filter locally based on current search/filter state to match view
            // Or export *everything*? Requirement says "Export currently filtered visitors"
            // Since filtering is client-side for now in this implementation (mostly), 
            // let's filter the full list locally.

            const filtered = allVisitors.filter(visitor => {
                const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    visitor.phone.includes(searchTerm);
                const matchesFilter = filterStatus === 'all' || visitor.status === filterStatus;
                return matchesSearch && matchesFilter;
            });

            if (filtered.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Pass ID', 'Visitor Name', 'Phone', 'Purpose', 'Person To Meet', 'Entry Time', 'Exit Time', 'Status'];
            const csvRows = [headers.join(',')];

            filtered.forEach(visitor => {
                const row = [
                    visitor.passId,
                    `"${visitor.name}"`, // Quote names to handle commas
                    visitor.phone,
                    `"${visitor.purpose}"`,
                    `"${visitor.personToMeet}"`,
                    visitor.entryTime ? new Date(visitor.entryTime).toLocaleString() : '',
                    visitor.exitTime ? new Date(visitor.exitTime).toLocaleString() : '',
                    visitor.status
                ];
                csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            const date = new Date().toISOString().split('T')[0];
            a.setAttribute('download', `visitors-${date}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export data");
        }
    };

    // Client-side filtering for the current page view (hybrid approach or full server-side is better, 
    // but relying on existing `getAllVisitors` which paginates. 
    // Note: Search/Filter logic was previously client-side in Dashboard. 
    // Ideally, backend should handle search. 
    // For now, I will implement client-side filtering on the *current page* or fetch all?
    // The requirement says "Refactor... Keep Search/Filter". 
    // If I paginate, client-side filtering only filters the current page, which is bad UX.
    // I should probably add search params to the backend `getAllVisitors` or `searchVisitors`.
    // But `adminController` has `searchVisitors` separate.
    // Let's stick to the existing pattern: `getAllVisitors` returns paginated data.
    // If I want to search, I should use `searchVisitors`, but that endpoint didn't support pagination in the previous code.
    // To keep it simple and robust as requested: 
    // I will implementation search/filter on the *fetched* data if it's small, OR 
    // I'll update the backend to support search in `getAllVisitors`. 
    // Looking at `adminController.js`, `getAllVisitors` doesn't filter.
    // Let's do this: Fetch *all* for rendering if search is active? No, that defeats pagination.
    // Let's implement client-side filtering on the *current page* for now to match the "clean" requirement without refactoring the entire backend search logic, 
    // UNLESS the user explicitly asked for backend search. 
    // The previous dashboard fetched *all* visitors (limit 10 in logic but maybe 100 in reality?)
    // Actually `getAllVisitors` forced limit 10.
    // AdminDashboard fetched `api.get('/visitors')` which hits `getAllVisitors` (limit 10).
    // So the previous dashboard only showed the last 10 visitors? 
    // Wait, the previous `AdminDashboard` used `getAllVisitors`?
    // Let's check `AdminDashboard.jsx` again.
    // `const fetchVisitors = async () => { const res = await api.get('/visitors'); ... }`
    // And `getAllVisitors` had `const pageSize = 10;`.
    // So distinct from "All Visitors", the dashboard only showed the *latest 10*.
    // The user wants "All Visitors" page.
    // So I should probably support pagination properly.
    // I will render the paginated list. Search will strictly be client-side on the *current page* 
    // OR I accept that search is limited for now.
    // *Correction*: To make "Export currently filtered visitors" work, and "Search" work properly, 
    // I really should have search on backend. 
    // BUT, for this task, I'll stick to:
    // 1. Pagination for main list.
    // 2. Search filters the *current page* (visual only) OR 
    // 3. I'll use the `searchVisitors` endpoint if a term exists.

    // Improved Logic:
    // If `searchTerm` exists, call `/admin/visitors/search?keyword=...` (which returns ALL matches, non-paginated usually).
    // If no search, call `/admin/visitors?page=...`

    useEffect(() => {
        if (searchTerm) {
            const doSearch = async () => {
                setLoading(true);
                try {
                    const res = await api.get(`/admin/visitors/search?keyword=${searchTerm}`);
                    setVisitors(res.data);
                    setTotalPages(1); // Search returns all, so 1 page
                } catch (err) { console.error(err); }
                finally { setLoading(false); }
            };
            const timeout = setTimeout(doSearch, 500);
            return () => clearTimeout(timeout);
        } else {
            fetchVisitors();
        }
    }, [searchTerm, page]);


    // Filter logic (status) can be client-side on the result set
    const filteredVisitors = visitors.filter(v => filterStatus === 'all' || v.status === filterStatus);

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1600px] mx-auto p-4"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">All Visitors</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and view detailed visitor logs</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium text-sm"
                >
                    <Download className="w-4 h-4" />
                    Download CSV
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-sm text-slate-700 outline-none cursor-pointer font-medium"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Visitor</th>
                                <th className="px-6 py-4">Pass ID</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Timing</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-32 bg-slate-100 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredVisitors.length > 0 ? (
                                filteredVisitors.map((visitor) => (
                                    <tr key={visitor._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    {visitor.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{visitor.name}</p>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                        <Phone className="w-3 h-3" />
                                                        {visitor.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {visitor.passId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    <span className="font-medium">To:</span> {visitor.personToMeet}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <FileText className="w-3 h-3 text-slate-400" />
                                                    <span className="italic">{visitor.purpose}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(visitor.entryTime)}
                                                </div>
                                                {visitor.exitTime && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 px-2 py-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(visitor.exitTime)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${visitor.status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${visitor.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {visitor.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No visitors found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Only show if not searching, as search returns all) */}
                {!searchTerm && totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing page <span className="text-slate-900 font-bold">{page}</span> of <span className="text-slate-900 font-bold">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AdminVisitors;
