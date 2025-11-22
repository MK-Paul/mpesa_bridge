import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Github, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
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
            const response = await authService.login(email, password);
            login(response.token, response.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass rounded-3xl p-8 border border-white/10 relative z-10"
            >
                <div className="text-center mb-8">
                    import {Link, useNavigate} from 'react-router-dom';
                    import {motion} from 'framer-motion';
                    import {Zap, ArrowRight, Github, Loader2} from 'lucide-react';
                    import {useEffect, useState} from 'react';
                    import {authService} from '../../services/auth.service';
                    import {useAuth} from '../../context/AuthContext';

                    export default function Login() {
    const navigate = useNavigate();
                    const {login} = useAuth();
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
            const response = await authService.login(email, password);
                    login(response.token, response.user);
                    navigate('/dashboard');
        } catch (err: any) {
                        setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
                        setLoading(false);
        }
    };

                    return (
                    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
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
                                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                                <p className="text-slate-400">Sign in to manage your payments</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/20 text-red-300 p-3 rounded-xl text-sm mb-6 text-center border border-red-500/30">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className="text-right mt-2">
                                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={18} className="animate-spin" />}
                                    Sign In <ArrowRight size={18} />
                                </button>
                            </form>

                            <div className="my-6 flex items-center gap-4">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-xs text-slate-500">OR CONTINUE WITH</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            <button className="w-full glass hover:bg-white/10 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                                <Github size={20} /> GitHub
                            </button>

                            <p className="text-center mt-8 text-sm text-slate-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
                                    Create one
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                    );
}
