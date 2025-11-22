import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                navigate('/');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.register(firstName, lastName, email, password);
            login(response.token, response.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass rounded-3xl p-8 border border-white/10 relative z-10"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Zap size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">M-Pesa Bridge</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-slate-400">Start accepting payments in minutes</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="you@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
