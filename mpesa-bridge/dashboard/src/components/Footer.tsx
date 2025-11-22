import { Zap, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/20 backdrop-blur-xl pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Zap size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">M-Pesa Bridge</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            The enterprise-grade payment gateway for modern African developers.
                            Secure, reliable, and built for scale.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                                <Github size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li><Link to="/features" className="text-slate-400 hover:text-primary transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="text-slate-400 hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link to="/docs" className="text-slate-400 hover:text-primary transition-colors">Documentation</Link></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-slate-400 hover:text-primary transition-colors">Community</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary transition-colors">API Reference</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary transition-colors">Status</a></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-slate-400 hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2025 M-Pesa Bridge. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
