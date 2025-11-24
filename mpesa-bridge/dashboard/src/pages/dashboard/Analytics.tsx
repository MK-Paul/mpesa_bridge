import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Activity,
    CheckCircle2,
    Target,
    Loader2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';
import api from '../../services/api';
import { useProjects } from '../../context/ProjectContext';

interface OverviewStats {
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    averageValue: number;
}

interface TimeSeriesData {
    date: string;
    revenue: number;
    count: number;
    successRate: number;
}

interface StatusData {
    status: string;
    count: number;
    totalAmount: number;
    [key: string]: any;
}

interface PaymentLinkPerformance {
    id: string;
    title: string;
    slug: string;
    revenue: number;
    transactions: number;
    successRate: number;
}

const STATUS_COLORS: Record<string, string> = {
    COMPLETED: '#10b981',
    PENDING: '#f59e0b',
    FAILED: '#ef4444',
    CANCELLED: '#f97316'
};

export default function Analytics() {
    const { activeProject } = useProjects();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

    const [overview, setOverview] = useState<OverviewStats>({
        totalRevenue: 0,
        totalTransactions: 0,
        successRate: 0,
        averageValue: 0
    });
    const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
    const [statusBreakdown, setStatusBreakdown] = useState<StatusData[]>([]);
    const [paymentLinks, setPaymentLinks] = useState<PaymentLinkPerformance[]>([]);

    useEffect(() => {
        if (activeProject) {
            fetchAnalytics();
        }
    }, [activeProject, dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = subDays(endDate, dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90);

            const params = new URLSearchParams({
                projectId: activeProject!.id,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            const [overviewRes, timeSeriesRes, statusRes, linksRes] = await Promise.all([
                api.get(`/analytics/overview?${params}`),
                api.get(`/analytics/time-series?${params}`),
                api.get(`/analytics/status-breakdown?${params}`),
                api.get(`/analytics/payment-links-performance?${params}`)
            ]);

            setOverview(overviewRes.data);
            setTimeSeries(timeSeriesRes.data.data || []);
            setStatusBreakdown(statusRes.data.data || []);
            setPaymentLinks(linksRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
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
            label: 'Total Revenue',
            value: `KES ${overview.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            trend: null
        },
        {
            label: 'Total Transactions',
            value: overview.totalTransactions.toString(),
            icon: Activity,
            color: 'from-blue-500 to-cyan-600',
            trend: null
        },
        {
            label: 'Success Rate',
            value: `${overview.successRate}%`,
            icon: CheckCircle2,
            color: 'from-purple-500 to-pink-600',
            trend: null
        },
        {
            label: 'Average Value',
            value: `KES ${overview.averageValue.toLocaleString()}`,
            icon: Target,
            color: 'from-orange-500 to-red-600',
            trend: null
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Transaction Analytics</h2>
                    <p className="text-slate-400">Insights into your payment performance</p>
                </div>

                {/* Date Range Selector */}
                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === range
                                ? 'bg-primary/20 text-primary'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                        </button>
                    ))}
                </div>
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Over Time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-4">Revenue Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={timeSeries}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
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
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Transaction Volume */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-4">Transaction Volume</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={timeSeries}>
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
                </motion.div>

                {/* Success Rate Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-4">Success Rate Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timeSeries}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                                tickFormatter={(value) => format(new Date(value), 'MMM d')}
                            />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                            />
                            <Line
                                type="monotone"
                                dataKey="successRate"
                                stroke="#a855f7"
                                strokeWidth={3}
                                dot={{ fill: '#a855f7', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-4">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusBreakdown}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                label={(entry: any) => `${entry.status}: ${entry.count}`}
                            >
                                {statusBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Payment Links Performance */}
            {paymentLinks.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-4">Payment Links Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Link</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Revenue</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Transactions</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentLinks.map((link) => (
                                    <tr key={link.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium text-white">{link.title}</p>
                                                <p className="text-sm text-slate-400">/{link.slug}</p>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4 font-semibold text-green-400">
                                            KES {link.revenue.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4 text-white">
                                            {link.transactions}
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${link.successRate >= 80
                                                ? 'bg-green-500/20 text-green-400'
                                                : link.successRate >= 50
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {link.successRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
