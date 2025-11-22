import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
    id: string;
    amount: number;
    phoneNumber: string;
    status: string;
    environment: string;
    createdAt: string;
    mpesaReceipt?: string;
    project: {
        name: string;
        user: {
            name: string;
            email: string;
        };
    };
}

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/transactions?status=${statusFilter}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'FAILED':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 size={16} />;
            case 'PENDING':
                return <Clock size={16} />;
            case 'FAILED':
                return <XCircle size={16} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">All Transactions</h2>
                    <p className="text-slate-400">Platform-wide transaction monitoring</p>
                </div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-400">Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                        <option value="">All Status</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
            </motion.div>

            {/* Transactions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl border border-white/10 overflow-hidden"
            >
                {transactions.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <Search size={64} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">No transactions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Project</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Phone</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Amount</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Env</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-white">{tx.project?.user?.name || 'Unknown User'}</p>
                                                <p className="text-xs text-slate-400">{tx.project?.user?.email || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-300">{tx.project?.name || 'Unknown Project'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white">{tx.phoneNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-white">KES {tx.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                                                {getStatusIcon(tx.status)}
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${tx.environment === 'SANDBOX'
                                                ? 'bg-orange-500/20 text-orange-400'
                                                : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                {tx.environment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-400 text-sm">
                                                {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
