import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';

export default function Overview() {
    // Mock data - will be replaced with real API data
    const stats = [
        {
            label: 'Total Revenue',
            value: 'KES 0',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            change: '+0%'
        },
        {
            label: 'Transactions',
            value: '0',
            icon: Activity,
            color: 'from-blue-500 to-cyan-600',
            change: '+0%'
        },
        {
            label: 'Success Rate',
            value: '0%',
            icon: CheckCircle2,
            color: 'from-purple-500 to-pink-600',
            change: '+0%'
        },
        {
            label: 'Growth',
            value: '+0%',
            icon: TrendingUp,
            color: 'from-orange-500 to-red-600',
            change: '+0%'
        },
    ];

    const recentTransactions = [
        // Will be populated from API
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
                                <span className="text-sm text-green-500 font-medium">{stat.change}</span>
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
                    <div className="space-y-4">
                        {/* Transaction list will go here */}
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
                    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h4 className="font-semibold mb-1">📚 View Documentation</h4>
                        <p className="text-sm text-slate-400">Learn how to integrate M-Pesa</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h4 className="font-semibold mb-1">🔑 Get API Keys</h4>
                        <p className="text-sm text-slate-400">Access your API credentials</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h4 className="font-semibold mb-1">⚡ Test Payment</h4>
                        <p className="text-sm text-slate-400">Try a test transaction</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
