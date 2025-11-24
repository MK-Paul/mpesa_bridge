import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, Smartphone } from 'lucide-react';

interface LinkDetails {
    id: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    project: {
        name: string;
    };
}

const Checkout = () => {
    const { slug } = useParams();
    const [details, setDetails] = useState<LinkDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchLinkDetails();
    }, [slug]);

    const fetchLinkDetails = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/payment-links/public/${slug}`);
            setDetails(response.data.data);
        } catch (error) {
            setStatus('error');
            setMessage('Payment link not found or inactive');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setStatus('idle');

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/payment-links/public/${slug}/pay`, {
                phoneNumber
            });
            setStatus('success');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Payment initiation failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!details) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Link Not Found</h1>
                    <p className="text-gray-400">This payment link does not exist or has been disabled.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-dark-card border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                        <Smartphone className="text-primary h-8 w-8" />
                    </div>
                    <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">{details.project.name}</h2>
                    <h1 className="text-2xl font-bold text-white mb-2">{details.title}</h1>
                    <p className="text-gray-400 text-sm">{details.description}</p>
                </div>

                {/* Amount */}
                <div className="text-center mb-8 p-6 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                    <p className="text-4xl font-bold text-white">
                        <span className="text-xl align-top text-gray-500 mr-1">{details.currency}</span>
                        {details.amount.toLocaleString()}
                    </p>
                </div>

                {/* Payment Form */}
                {status === 'success' ? (
                    <div className="text-center py-6">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Check your phone!</h3>
                        <p className="text-gray-400">
                            We've sent an M-Pesa prompt to <strong>{phoneNumber}</strong>.
                            Please enter your PIN to complete the payment.
                        </p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 text-primary hover:text-primary/80 transition-colors"
                        >
                            Use a different number
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                M-Pesa Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="0712 345 678"
                                className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-white focus:border-primary/50 outline-none transition-colors text-lg"
                            />
                        </div>

                        {status === 'error' && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-red-400 text-sm">{message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing || !phoneNumber}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Pay Now'
                            )}
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        Secured by <span className="text-white font-semibold">M-Pesa Bridge</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Checkout;
