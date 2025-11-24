import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Code2,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Loader2,
    ExternalLink,
    Key,
    Box
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import api from '../../services/api';

interface ApiUsageData {
    totalCalls: number;
    usageHistory: { date: string; count: number }[];
    topEndpoints: { endpoint: string; count: number }[];
}

export default function Developer() {
    const [loading, setLoading] = useState(true);
    const [apiUsage, setApiUsage] = useState<ApiUsageData>({
        totalCalls: 0,
        usageHistory: [],
        topEndpoints: []
    });

    useEffect(() => {
        fetchDeveloperData();
    }, []);

    const fetchDeveloperData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/user/api-usage');
            setApiUsage(response.data);
        } catch (error) {
            console.error('Failed to fetch developer data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const stats = [
        {
            label: 'Total API Calls (7d)',
            value: apiUsage.totalCalls.toString(),
            icon: Activity,
            color: 'from-blue-500 to-cyan-600'
        },
        {
            label: 'Active Endpoints',
            value: apiUsage.topEndpoints.length.toString(),
            icon: Code2,
            color: 'from-purple-500 to-pink-600'
        },
        {
            label: 'API Health',
            value: 'Operational',
            icon: CheckCircle2,
            color: 'from-green-500 to-emerald-600'
        },
        {
            label: 'Avg Response Time',
            value: '< 500ms',
            icon: Clock,
            color: 'from-orange-500 to-red-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold mb-2">Developer Tools</h2>
                <p className="text-slate-400">Monitor your API usage and performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass rounded-2xl p-6 border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* API Usage Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 glass rounded-2xl p-6 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">API Usage</h3>
                        <span className="text-sm text-slate-400">Last 7 Days</span>
                    </div>

                    {apiUsage.usageHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={apiUsage.usageHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8' }}
                                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                                />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-500">
                            <div className="text-center">
                                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No API calls yet</p>
                                <p className="text-sm mt-2">Start making API requests to see usage data</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Top Endpoints */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-6">Top Endpoints</h3>
                    <div className="space-y-4">
                        {apiUsage.topEndpoints.length > 0 ? (
                            apiUsage.topEndpoints.map((endpoint, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono text-slate-400">
                                            {i + 1}
                                        </div>
                                        <code className="text-sm text-slate-300 truncate" title={endpoint.endpoint}>
                                            {endpoint.endpoint}
                                        </code>
                                    </div>
                                    <span className="text-sm font-semibold text-white ml-2">{endpoint.count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-8">No API calls yet</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group"
                    >
                        <div>
                            <h4 className="font-semibold mb-1 flex items-center gap-2">
                                📚 API Documentation
                                <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h4>
                            <p className="text-sm text-slate-400">View complete API reference</p>
                        </div>
                    </a>

                    <a
                        href="/dashboard/api-keys"
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                            <Key size={18} />
                            API Keys
                        </h4>
                        <p className="text-sm text-slate-400">Manage your credentials</p>
                    </a>

                    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                            <Box size={18} />
                            SDK Downloads
                        </h4>
                        <p className="text-sm text-slate-400">Client libraries & SDKs</p>
                    </div>
                </div>
            </motion.div>

            {/* API Health Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <h3 className="text-xl font-bold mb-4">API Health Status</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-medium">API Gateway</span>
                        </div>
                        <span className="text-green-400 text-sm font-medium">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-medium">M-Pesa Integration</span>
                        </div>
                        <span className="text-green-400 text-sm font-medium">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-medium">Webhook Delivery</span>
                        </div>
                        <span className="text-green-400 text-sm font-medium">Operational</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
