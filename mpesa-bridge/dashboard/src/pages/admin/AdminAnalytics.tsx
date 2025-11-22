import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Activity, Loader2, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Analytics {
    totalUsers: number;
    totalProjects: number;
    totalTransactions: number;
    totalRevenue: number;
    successRate: number;
    recentUsers: number;
}

export default function AdminAnalytics() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/analytics`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Revenue',
            value: `KES ${analytics?.totalRevenue.toLocaleString() || 0}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600'
        },
        {
            label: 'Total Users',
            value: analytics?.totalUsers.toString() || '0',
            icon: Users,
            color: 'from-blue-500 to-cyan-600',
            change: analytics?.recentUsers || 0
        },
        {
            label: 'Total Transactions',
            value: analytics?.totalTransactions.toString() || '0',
            icon: Activity,
            color: 'from-purple-500 to-pink-600'
        },
        {
            label: 'Success Rate',
            value: `${analytics?.successRate || 0}%`,
            icon: TrendingUp,
            color: 'from-orange-500 to-red-600'
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Platform Analytics</h2>
                <p className="text-slate-400">System-wide statistics and metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                {stat.change !== undefined && stat.change > 0 && (
                                    <span className="text-sm font-medium flex items-center gap-1 text-green-500">
                                        <ArrowUpRight size={16} />
                                        +{stat.change}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Additional Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <h3 className="text-xl font-bold mb-4">Platform Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Total Projects</p>
                        <p className="text-3xl font-bold">{analytics?.totalProjects || 0}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-1">New Users (30 days)</p>
                        <p className="text-3xl font-bold text-green-400">+{analytics?.recentUsers || 0}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
