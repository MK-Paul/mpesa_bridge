import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Calendar, CreditCard, Phone, Receipt, AlertCircle } from 'lucide-react';
import { useState } from 'react';

import type { Transaction } from '../types';

interface TransactionDetailsModalProps {
    transaction: Transaction | null;
    onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
    const [copied, setCopied] = useState(false);

    if (!transaction) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statusColors = {
        COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
        PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        FAILED: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass rounded-2xl p-6 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Transaction Details</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Transaction ID */}
                    <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-sm text-slate-400 mb-2">Transaction ID</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-white font-mono text-sm">{transaction.id}</code>
                            <button
                                onClick={() => copyToClipboard(transaction.id)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                title="Copy ID"
                            >
                                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Amount */}
                        <div className="p-4 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <CreditCard size={16} />
                                <p className="text-sm">Amount</p>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                KES {transaction.amount.toLocaleString()}
                            </p>
                        </div>

                        {/* Phone Number */}
                        <div className="p-4 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Phone size={16} />
                                <p className="text-sm">Phone Number</p>
                            </div>
                            <p className="text-xl font-semibold text-white">{transaction.phoneNumber}</p>
                        </div>

                        {/* Status */}
                        <div className="p-4 rounded-xl bg-white/5">
                            <p className="text-sm text-slate-400 mb-2">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${statusColors[transaction.status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                {transaction.status}
                            </span>
                        </div>

                        {/* M-Pesa Receipt */}
                        <div className="p-4 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Receipt size={16} />
                                <p className="text-sm">M-Pesa Receipt</p>
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {transaction.mpesaReceipt || 'N/A'}
                            </p>
                        </div>

                        {/* Created At */}
                        <div className="p-4 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Calendar size={16} />
                                <p className="text-sm">Created</p>
                            </div>
                            <p className="text-sm text-white">{formatDate(transaction.createdAt)}</p>
                        </div>

                        {/* Updated At */}
                        <div className="p-4 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Calendar size={16} />
                                <p className="text-sm">Last Updated</p>
                            </div>
                            <p className="text-sm text-white">{formatDate(transaction.updatedAt)}</p>
                        </div>
                    </div>

                    {/* Failure Reason (if exists) */}
                    {transaction.failureReason && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                                <AlertCircle size={16} />
                                <p className="text-sm font-semibold">Failure Reason</p>
                            </div>
                            <p className="text-sm text-red-300">{transaction.failureReason}</p>
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
