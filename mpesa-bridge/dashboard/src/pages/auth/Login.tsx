import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Github } from 'lucide-react';

export default function Login() {
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

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="you@company.com"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-400">Password</label>
                            <a href="#" className="text-xs text-primary hover:text-primary/80">Forgot password?</a>
                        </div>
                        <input
                            type="password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
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
