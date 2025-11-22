import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Zap, Globe, Code, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-white overflow-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Zap size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            M-Pesa Bridge
                        </span>
                    </div>

                    {/* Desktop Navigation (Center) */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</Link>
                        <Link to="/docs" className="text-sm text-slate-400 hover:text-white transition-colors">Documentation</Link>
                        <Link to="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
                    </div>

                    {/* Desktop Actions (Right) */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-surface border-b border-white/10 overflow-hidden"
                        >
                            <div className="px-6 py-8 flex flex-col gap-6">
                                <a href="#features" className="text-slate-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
                                <Link to="/docs" className="text-slate-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Documentation</Link>
                                <a href="#pricing" className="text-slate-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                                <div className="h-px bg-white/10 my-2" />
                                <Link to="/login" className="text-slate-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                                <Link to="/register" className="text-primary font-medium" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6 inline-block">
                            Enterprise Grade Payment Gateway
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            The Modern Way to Accept <br />
                            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                M-Pesa Payments
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                            Integrate M-Pesa into your apps in minutes, not days.
                            Secure, reliable, and built for developers.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2 transition-all hover:scale-105"
                            >
                                Start Integration <ArrowRight size={20} />
                            </Link>
                            <a
                                href="https://github.com/MK-Paul/mpesa_bridge"
                                target="_blank"
                                className="px-8 py-4 rounded-full glass hover:bg-white/10 text-white font-medium transition-all"
                            >
                                View Documentation
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 relative">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Shield,
                            title: "Bank-Grade Security",
                            desc: "End-to-end encryption, IP whitelisting, and automated fraud detection."
                        },
                        {
                            icon: Code,
                            title: "Developer First",
                            desc: "Clean SDKs for Node.js, React Native, and Flutter. Ready in minutes."
                        },
                        {
                            icon: Globe,
                            title: "Global Scale",
                            desc: "Built on edge infrastructure to handle millions of transactions with zero latency."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="glass p-8 rounded-3xl hover:bg-white/5 transition-colors border border-white/5"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-primary">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Code Preview */}
            <section className="py-20 px-6 bg-white/2">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold mb-6">Just 3 Lines of Code</h2>
                        <p className="text-slate-400 text-lg mb-8">
                            Stop wrestling with complex XML APIs. Our SDK handles authentication,
                            retries, and error parsing for you.
                        </p>
                        <ul className="space-y-4">
                            {['Type-safe SDKs', 'Automatic Token Management', 'Real-time Webhooks'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="glass rounded-2xl p-1 border border-white/10 shadow-2xl">
                            <div className="bg-[#0d1117] rounded-xl p-6 overflow-hidden">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <pre className="font-mono text-sm text-slate-300 overflow-x-auto">
                                    <code>{`import { MpesaBridge } from 'mpesa-bridge-sdk';

const mpesa = new MpesaBridge('pk_live_...');

// Initiate Payment
await mpesa.pay({
  phone: '0712345678',
  amount: 1000,
  reference: 'Order #123'
});`}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
