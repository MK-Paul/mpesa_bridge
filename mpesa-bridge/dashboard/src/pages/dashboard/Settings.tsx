import { motion } from 'framer-motion';
import { User, Lock, Webhook, Save, Loader2, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import axios from 'axios';
import MpesaCredentialsForm from '../../components/MpesaCredentialsForm';

export default function Settings() {
    const { user } = useAuth();
    const { activeProject, refreshProjects } = useProjects();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Profile state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Webhook state
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        if (activeProject) {
            setWebhookUrl(activeProject.webhookUrl || '');
            setWebhookSecret(activeProject.webhookSecret || '');
        } else {
            setWebhookUrl('');
            setWebhookSecret('');
        }
    }, [activeProject]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/user/profile`,
                { name, email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/user/password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error: any) {
            console.error('Failed to change password:', error);
            alert(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProject) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/projects/${activeProject.id}/webhook`,
                { webhookUrl, webhookSecret },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await refreshProjects();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update webhook:', error);
            alert('Failed to update webhook configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Settings</h2>
                <p className="text-slate-400">Manage your account and integration settings</p>
            </div>

            {/* Profile Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <User size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Profile Information</h3>
                        <p className="text-sm text-slate-400">Update your account details</p>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="you@company.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : saved ? (
                            'Saved!'
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Password Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <Lock size={20} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Change Password</h3>
                        <p className="text-sm text-slate-400">Update your password regularly for security</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : saved ? (
                            'Password Updated!'
                        ) : (
                            <>
                                <Lock size={18} />
                                Update Password
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* M-Pesa Credentials Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <CreditCard size={20} className="text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">M-Pesa Configuration</h3>
                        <p className="text-sm text-slate-400">Set up your live M-Pesa credentials</p>
                    </div>
                </div>

                {activeProject ? (
                    <MpesaCredentialsForm activeProject={activeProject} onUpdate={refreshProjects} />
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        Please select a project to configure M-Pesa.
                    </div>
                )}
            </motion.div>

            {/* Webhook Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Webhook size={20} className="text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Webhook Configuration</h3>
                        <p className="text-sm text-slate-400">Receive payment notifications to your server</p>
                    </div>
                </div>

                {activeProject ? (
                    <form onSubmit={handleSaveWebhook} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Webhook URL</label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="https://your-server.com/webhooks/mpesa"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                This URL will receive POST requests when transactions are completed
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Webhook Secret (Optional)</label>
                            <input
                                type="text"
                                value={webhookSecret}
                                onChange={(e) => setWebhookSecret(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="your-webhook-secret"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Use this to verify webhook requests are from M-Pesa Bridge
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-200 mb-2">
                                <strong>Note:</strong> Webhooks will send the following payload:
                            </p>
                            <pre className="text-xs text-slate-400 overflow-x-auto">
                                {`{
  "transactionId": "abc123",
  "status": "COMPLETED",
  "amount": 1000,
  "phoneNumber": "0712345678",
  "mpesaReceipt": "QA12BC3DE4",
  "timestamp": "2024-01-01T12:00:00Z"
}`}
                            </pre>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : saved ? (
                                'Saved!'
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Webhook
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        Please select a project to configure webhooks.
                    </div>
                )}
            </motion.div>
        </div>
    );
}
