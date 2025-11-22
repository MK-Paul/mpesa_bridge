import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Code, Lock, Smartphone } from 'lucide-react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function FeaturesPage() {
    const features = [
        {
            icon: Shield,
            title: "Bank-Grade Security",
            desc: "We use AES-256 encryption and strict IP whitelisting to ensure every transaction is secure. Your credentials never leave our encrypted vaults."
        },
        {
            icon: Zap,
            title: "Instant Settlements",
            desc: "Transactions are processed in milliseconds. Get real-time confirmation for every payment via our WebSocket infrastructure."
        },
        {
            icon: Code,
            title: "Developer First SDKs",
            desc: "Why write 100 lines of XML? Our TypeScript SDKs let you integrate M-Pesa in just 3 lines of code. Full type safety included."
        },
        {
            icon: Globe,
            title: "Global Edge Network",
            desc: "Our API is deployed on a global edge network, ensuring low latency regardless of where your users are located."
        },
        {
            icon: Lock,
            title: "Fraud Detection",
            desc: "Built-in rate limiting and anomaly detection to prevent abuse and protect your business from fraudulent transactions."
        },
        {
            icon: Smartphone,
            title: "Mobile Optimized",
            desc: "Our SDKs are built for React Native and Flutter out of the box. Perfect for mobile-first African markets."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-white">
            <nav className="fixed w-full z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link to="/" className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="font-bold text-lg">Features</span>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h1 className="text-5xl font-bold mb-6">Everything you need to <br />accept payments</h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            We've abstracted away the complexity of the Daraja API so you can focus on building your product.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass p-8 rounded-3xl border border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="glass rounded-3xl p-12 text-center border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-accent/10 pointer-events-none" />
                        <h2 className="text-3xl font-bold mb-6 relative z-10">Ready to get started?</h2>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto relative z-10">
                            Join thousands of developers building the future of African commerce.
                        </p>
                        <Link
                            to="/register"
                            className="inline-block px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-slate-200 transition-colors relative z-10"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
