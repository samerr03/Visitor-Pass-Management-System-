import { useState, useEffect } from 'react';
import api from '../api/axios';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        performedBy: '', // search by name
        startDate: '',
        endDate: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 15,
                ...filters
            };
            // Remove empty filters
            Object.keys(params).forEach(key => !params[key] && delete params[key]);

            const res = await api.get('/audit-logs', { params });
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
            setTotalLogs(res.data.total);
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, filters]); // Re-fetch on filter/page change

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1); // Reset to page 1 on filter change
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            performedBy: '',
            startDate: '',
            endDate: ''
        });
        setPage(1);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">System Audit Logs</h1>
                    <div className="text-sm text-gray-500">
                        Total Records: <span className="font-semibold text-gray-900">{totalLogs}</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Action Type</label>
                        <select
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="ENTRY">ENTRY</option>
                            <option value="EXIT">EXIT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="CREATE">CREATE</option>
                            <option value="APPROVE">APPROVE</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Performed By</label>
                        <input
                            type="text"
                            name="performedBy"
                            placeholder="Search User..."
                            value={filters.performedBy}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={clearFilters}
                            className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Visitor</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Performed By</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">Loading logs...</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400">No logs found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log._id}
                                            className={`hover:bg-gray-50 transition-colors ${log.action === 'DELETE' ? 'bg-red-50 hover:bg-red-100' : ''}`}
                                        >
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${log.action === 'ENTRY' ? 'bg-green-100 text-green-800' :
                                                        log.action === 'EXIT' ? 'bg-blue-100 text-blue-800' :
                                                            log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'}`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-gray-900">
                                                {log.visitorName}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-900">{log.performedBy?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 capitalize">{log.performedBy?.role || 'System'}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString()}
                                                <div className="text-xs text-gray-400 mt-0.5">{log.ipAddress}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500 truncate max-w-xs" title={log.notes}>
                                                {log.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
