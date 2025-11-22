import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Activity, CheckCircle2, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Analytics {
    totalRevenue: number;
    totalTransactions: number;
    completedTransactions: number;
    successRate: number;
    growth: number;
}

interface Transaction {
    id: string;
    amount: number;
    phoneNumber: string;
    status: string;
    createdAt: string;
}

export default function Overview() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [analyticsRes, transactionsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/user/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/user/transactions?limit=5`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setAnalytics(analyticsRes.data.analytics);
            setRecentTransactions(transactionsRes.data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch overview data:', error);
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
            value: `KES ${analytics?.totalRevenue.toLocaleString() || 0}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            change: analytics?.growth || 0
        },
        {
            label: 'Transactions',
            value: analytics?.totalTransactions.toString() || '0',
            icon: Activity,
            color: 'from-blue-500 to-cyan-600',
            change: analytics?.growth || 0
        },
        {
            label: 'Success Rate',
            value: `${analytics?.successRate || 0}%`,
            icon: CheckCircle2,
            color: 'from-purple-500 to-pink-600',
            change: 0
        },
        {
            label: 'Growth',
            value: `${analytics?.growth || 0}%`,
            icon: TrendingUp,
            color: 'from-orange-500 to-red-600',
            change: analytics?.growth || 0
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
                <p className="text-slate-400">Here's what's happening with your payments today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const isPositive = stat.change >= 0;
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
                                {stat.change !== 0 && (
                                    <span className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {Math.abs(stat.change)}%
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
                {recentTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Activity size={32} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 mb-2">No transactions yet</p>
                        <p className="text-sm text-slate-500">Your recent transactions will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                                <div className="flex-1">
                                    <p className="font-medium text-white">{tx.phoneNumber}</p>
                                    <p className="text-sm text-slate-400">
                                        {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-white">KES {tx.amount.toLocaleString()}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                            tx.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <h3 className="text-xl font-bold mb-4">Quick Start</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="/docs" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h4 className="font-semibold mb-1">📚 View Documentation</h4>
                        <p className="text-sm text-slate-400">Learn how to integrate M-Pesa</p>
                    </a>
                    <a href="/dashboard/keys" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h4 className="font-semibold mb-1">🔑 Get API Keys</h4>
                        <p className="text-sm text-slate-400">Access your API credentials</p>
                    </a>
                    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h4 className="font-semibold mb-1">⚡ Test Payment</h4>
                        <p className="text-sm text-slate-400">Try a test transaction</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
