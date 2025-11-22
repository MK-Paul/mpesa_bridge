import { useState, useEffect } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import type { Project } from '../context/ProjectContext';

interface Props {
    activeProject: Project;
    onUpdate: () => Promise<void>;
}

export default function MpesaCredentialsForm({ activeProject, onUpdate }: Props) {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [shortCode, setShortCode] = useState('');
    const [consumerKey, setConsumerKey] = useState('');
    const [consumerSecret, setConsumerSecret] = useState('');
    const [passkey, setPasskey] = useState('');

    const [showConsumerKey, setShowConsumerKey] = useState(false);
    const [showConsumerSecret, setShowConsumerSecret] = useState(false);
    const [showPasskey, setShowPasskey] = useState(false);

    useEffect(() => {
        if (activeProject) {
            setShortCode(activeProject.shortCode || '');
            // Secrets are not returned by API for security, so we leave them empty
            // unless we want to show a placeholder indicating they are set
            setConsumerKey('');
            setConsumerSecret('');
            setPasskey('');
        }
    }, [activeProject]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload: any = { shortCode };

            // Only send secrets if they are provided (to update)
            if (consumerKey) payload.consumerKey = consumerKey;
            if (consumerSecret) payload.consumerSecret = consumerSecret;
            if (passkey) payload.passkey = passkey;

            await axios.put(
                `${import.meta.env.VITE_API_URL}/projects/${activeProject.id}/mpesa-credentials`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await onUpdate();
            setSaved(true);
            // Clear secrets from state after save
            setConsumerKey('');
            setConsumerSecret('');
            setPasskey('');

            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update M-Pesa credentials:', error);
            alert('Failed to update M-Pesa credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Business Short Code</label>
                <input
                    type="text"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. 174379"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Consumer Key</label>
                <div className="relative">
                    <input
                        type={showConsumerKey ? "text" : "password"}
                        value={consumerKey}
                        onChange={(e) => setConsumerKey(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder={activeProject.consumerKey ? "•••••••• (Configured)" : "Enter Consumer Key"}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConsumerKey(!showConsumerKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                        {showConsumerKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Consumer Secret</label>
                <div className="relative">
                    <input
                        type={showConsumerSecret ? "text" : "password"}
                        value={consumerSecret}
                        onChange={(e) => setConsumerSecret(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder={activeProject.consumerSecret ? "•••••••• (Configured)" : "Enter Consumer Secret"}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConsumerSecret(!showConsumerSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                        {showConsumerSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Passkey</label>
                <div className="relative">
                    <input
                        type={showPasskey ? "text" : "password"}
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder={activeProject.passkey ? "•••••••• (Configured)" : "Enter Passkey"}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasskey(!showPasskey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                        {showPasskey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-200">
                    <strong>Note:</strong> These credentials will be used for <strong>LIVE</strong> transactions. Ensure they are correct to avoid payment failures.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-all disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : saved ? (
                    'Saved!'
                ) : (
                    <>
                        <Save size={18} />
                        Save Credentials
                    </>
                )}
            </button>
        </form>
    );
}
