import { motion } from 'framer-motion';
import { Search, Download, Filter, CheckCircle2, XCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
    id: string;
    amount: number;
    phoneNumber: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    mpesaReceipt?: string;
    createdAt: string;
}

export default function Transactions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const status = statusFilter !== 'ALL' ? statusFilter : '';
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/user/transactions?status=${status}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTransactions(response.data.transactions || []);
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

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.phoneNumber.includes(searchQuery) ||
            tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tx.mpesaReceipt && tx.mpesaReceipt.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const status = statusFilter !== 'ALL' ? statusFilter : '';
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/user/transactions?status=${status}&format=csv`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export transactions');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Transactions</h2>
                    <p className="text-slate-400">View and manage all your M-Pesa transactions</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all"
                >
                    <Download size={18} />
                    Export
                </button>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by phone, ID, or receipt..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="ALL">All Status</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Transactions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl border border-white/10 overflow-hidden"
            >
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 mb-2 font-medium">No transactions found</p>
                        <p className="text-sm text-slate-500">
                            {searchQuery || statusFilter !== 'ALL'
                                ? 'Try adjusting your search or filters'
                                : 'Your transactions will appear here once you start accepting payments'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Transaction ID</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Phone Number</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Amount</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Receipt</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-slate-300">{tx.id.slice(0, 8)}...</span>
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
                                            {tx.mpesaReceipt ? (
                                                <span className="font-mono text-sm text-green-400">{tx.mpesaReceipt}</span>
                                            ) : (
                                                <span className="text-slate-500 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-400 text-sm">
                                                {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary hover:text-primary/80 transition-colors">
                                                <ExternalLink size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Stats Summary */}
            {filteredTransactions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Transactions</p>
                            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Amount</p>
                            <p className="text-2xl font-bold">
                                KES {filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Success Rate</p>
                            <p className="text-2xl font-bold text-green-400">
                                {((filteredTransactions.filter(tx => tx.status === 'COMPLETED').length / filteredTransactions.length) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
