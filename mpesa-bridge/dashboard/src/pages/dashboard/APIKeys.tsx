import { motion } from 'framer-motion';
import { Key, Copy, Check, Eye, EyeOff, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
    id: string;
    name: string;
    publicKey: string;
    secretKey: string;
    createdAt: string;
}

export default function APIKeys() {
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string>('');
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        fetchProject();
    }, []);

    const fetchProject = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.projects && response.data.projects.length > 0) {
                setProject(response.data.projects[0]);
            }
        } catch (error) {
            console.error('Failed to fetch project:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, keyType: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(keyType);
        setTimeout(() => setCopiedKey(''), 2000);
    };

    const handleRegenerateKeys = async () => {
        if (!project) return;

        const confirmed = window.confirm(
            'Are you sure? This will regenerate your keys. Your old keys will stop working immediately!'
        );

        if (!confirmed) return;

        try {
            setRegenerating(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/projects/${project.id}/regenerate`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(response.data.project);
            alert('Keys regenerated successfully!');
        } catch (error) {
            console.error('Failed to regenerate keys:', error);
            alert('Failed to regenerate keys. Please try again.');
        } finally {
            setRegenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">No project found. Please contact support.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">API Keys</h2>
                <p className="text-slate-400">Manage your API credentials for M-Pesa Bridge integration</p>
            </div>

            {/* Warning Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border border-orange-500/20 bg-orange-500/5"
            >
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={20} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-orange-400 mb-1">Keep your Secret Key safe!</h3>
                        <p className="text-sm text-slate-400">
                            Never share your Secret Key or commit it to version control.
                            Use environment variables to store your keys securely.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Public Key */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Key size={20} className="text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Public Key</h3>
                        <p className="text-sm text-slate-400">Use this in your client-side code</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                        {project.publicKey}
                    </div>
                    <button
                        onClick={() => copyToClipboard(project.publicKey, 'public')}
                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        title="Copy to clipboard"
                    >
                        {copiedKey === 'public' ? (
                            <Check size={20} className="text-green-500" />
                        ) : (
                            <Copy size={20} className="text-slate-400" />
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Secret Key */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <Key size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Secret Key</h3>
                        <p className="text-sm text-slate-400">Keep this private - server-side only</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                        {showSecretKey ? project.secretKey : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                    </div>
                    <button
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        title={showSecretKey ? 'Hide key' : 'Show key'}
                    >
                        {showSecretKey ? (
                            <EyeOff size={20} className="text-slate-400" />
                        ) : (
                            <Eye size={20} className="text-slate-400" />
                        )}
                    </button>
                    <button
                        onClick={() => copyToClipboard(project.secretKey, 'secret')}
                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        title="Copy to clipboard"
                    >
                        {copiedKey === 'secret' ? (
                            <Check size={20} className="text-green-500" />
                        ) : (
                            <Copy size={20} className="text-slate-400" />
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Usage Instructions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <h3 className="font-semibold text-lg mb-4">Quick Start</h3>
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-sm text-slate-300 mb-2">1. Install the SDK</p>
                        <code className="text-xs text-primary">npm install mpesa-bridge-sdk</code>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-sm text-slate-300 mb-2">2. Initialize with your Public Key</p>
                        <pre className="text-xs text-slate-400 overflow-x-auto">
                            {`import { MpesaBridge } from 'mpesa-bridge-sdk';

const mpesa = new MpesaBridge({
  apiKey: '${project.publicKey}'
});`}
                        </pre>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-sm text-slate-300 mb-2">3. Make a payment</p>
                        <pre className="text-xs text-slate-400 overflow-x-auto">
                            {`const response = await mpesa.pay({
  phone: '0712345678',
  amount: 100,
  reference: 'Order #123'
});`}
                        </pre>
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <a
                        href="/docs"
                        className="flex-1 text-center px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all"
                    >
                        View Full Documentation
                    </a>
                </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6 border border-red-500/20 bg-red-500/5"
            >
                <h3 className="font-semibold text-lg mb-4 text-red-400">Danger Zone</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white mb-1">Regenerate API Keys</p>
                        <p className="text-sm text-slate-400">
                            All existing keys will stop working immediately. Your applications will need to be updated.
                        </p>
                    </div>
                    <button
                        onClick={handleRegenerateKeys}
                        disabled={regenerating}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all disabled:opacity-50"
                    >
                        {regenerating ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <RefreshCw size={18} />
                        )}
                        {regenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
