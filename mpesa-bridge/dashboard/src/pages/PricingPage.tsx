import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background text-white">
            <nav className="fixed w-full z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link to="/" className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="font-bold text-lg">Pricing</span>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">Simple, transparent pricing</h1>
                    <p className="text-xl text-slate-400 mb-16">
                        Start for free, scale as you grow. No hidden fees.
                    </p>

                    <div className="max-w-md mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-3xl p-8 border-2 border-primary relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                POPULAR
                            </div>

                            <h3 className="text-2xl font-bold mb-2">Developer</h3>
                            <div className="flex items-baseline justify-center gap-1 mb-6">
                                <span className="text-5xl font-bold">KES 0</span>
                                <span className="text-slate-400">/month</span>
                            </div>

                            <p className="text-slate-400 mb-8">
                                Perfect for side projects and startups just getting started.
                            </p>

                            <ul className="space-y-4 text-left mb-8">
                                {[
                                    'Unlimited Transactions',
                                    'Real-time Webhooks',
                                    'Community Support',
                                    'Basic Analytics',
                                    '1 Team Member'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-green-500" />
                                        </div>
                                        <span className="text-slate-300">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className="block w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all hover:scale-[1.02]"
                            >
                                Get Started Now
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
