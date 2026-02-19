import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';
import { Calendar, ChevronDown } from 'lucide-react';

const VisitorChart = () => {
    const [data, setData] = useState([]);
    const [range, setRange] = useState('7days'); // '7days' or 'weekly'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [range]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/analytics/visitors?range=${range}`);
            setData(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-slate-700/50 text-xs">
                    <p className="font-medium mb-2 text-slate-300 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {label}
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{payload[0].value}</span>
                        <span className="text-slate-400">visitors</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 h-full flex flex-col relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Visitors Overview</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {range === '7days' ? 'Last 7 days visitor trend' : 'Weekly visitor trends'}
                    </p>
                </div>
                <div className="flex bg-slate-100/80 p-1 rounded-xl backdrop-blur-sm">
                    <button
                        onClick={() => setRange('7days')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${range === '7days'
                            ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setRange('weekly')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${range === 'weekly'
                            ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        Weekly
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full min-w-0 relative z-10">
                {loading ? (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-xs text-slate-400 font-medium animate-pulse">Loading data...</span>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                                dy={15}
                                tickFormatter={(str) => {
                                    if (range === 'weekly') return str.replace('-', 'W');
                                    const d = new Date(str);
                                    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVisitors)"
                                animationDuration={2000}
                                animationEasing="ease-in-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium">No visitor data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitorChart;
