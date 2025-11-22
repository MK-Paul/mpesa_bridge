import { motion } from 'framer-motion';
import { ArrowLeft, Book, Code, Smartphone, Globe, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Documentation() {
    const [copied, setCopied] = useState('');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(''), 2000);
    };

    const CodeBlock = ({ code }: { code: string }) => (
        <div className="relative group mt-4 mb-6">
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => copyToClipboard(code)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    {copied === code ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
            </div>
            <div className="bg-[#0d1117] rounded-xl p-6 overflow-x-auto border border-white/10">
                <pre className="font-mono text-sm text-slate-300">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link to="/" className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="font-bold text-lg">Documentation</span>
                </div>
            </nav>

            <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
                    <div className="sticky top-32 space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Getting Started</h3>
                            <ul className="space-y-3">
                                <li><a href="#introduction" className="text-primary font-medium">Introduction</a></li>
                                <li><a href="#installation" className="text-slate-400 hover:text-white transition-colors">Installation</a></li>
                                <li><a href="#authentication" className="text-slate-400 hover:text-white transition-colors">Authentication</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Integration</h3>
                            <ul className="space-y-3">
                                <li><a href="#web-integration" className="text-slate-400 hover:text-white transition-colors">Web Integration</a></li>
                                <li><a href="#mobile-integration" className="text-slate-400 hover:text-white transition-colors">Mobile (React Native)</a></li>
                                <li><a href="#webhooks" className="text-slate-400 hover:text-white transition-colors">Webhooks</a></li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-invert max-w-none"
                    >
                        <section id="introduction" className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-primary/20 text-primary">
                                    <Book size={24} />
                                </div>
                                <h1 className="text-4xl font-bold m-0">Introduction</h1>
                            </div>
                            <p className="text-xl text-slate-400 leading-relaxed">
                                M-Pesa Bridge is the easiest way to integrate M-Pesa payments into your application.
                                Whether you are building a website, a mobile app, or a backend service, our unified SDK
                                handles the complexity of the Daraja API for you.
                            </p>
                        </section>

                        <section id="installation" className="mb-16">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Code size={24} className="text-secondary" /> Installation
                            </h2>
                            <p className="text-slate-400 mb-4">
                                Install the SDK using your preferred package manager. It works for both Web and Node.js environments.
                            </p>
                            <CodeBlock code="npm install mpesa-bridge-sdk" />
                        </section>

                        <section id="authentication" className="mb-16">
                            <h2 className="text-2xl font-bold mb-6">Authentication</h2>
                            <p className="text-slate-400 mb-4">
                                Initialize the client with your Public API Key. You can find this in your
                                <Link to="/dashboard" className="text-primary hover:underline mx-1">Dashboard</Link>.
                            </p>
                            <CodeBlock code={`import { MpesaBridge } from 'mpesa-bridge-sdk';

const mpesa = new MpesaBridge({
  apiKey: 'pk_live_your_public_key_here'
});`} />
                        </section>

                        <section id="web-integration" className="mb-16">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Globe size={24} className="text-green-500" /> Web Integration
                            </h2>
                            <p className="text-slate-400 mb-4">
                                Trigger an STK Push directly from your frontend. The SDK automatically handles
                                polling for status updates via WebSocket.
                            </p>
                            <CodeBlock code={`// Trigger Payment
const response = await mpesa.pay({
  phone: '0712345678',
  amount: 1000,
  reference: 'Order #123'
});

// Listen for Real-time Success
mpesa.subscribeToUpdates(response.transactionId, (data) => {
  if (data.status === 'COMPLETED') {
    alert('Payment Successful! Receipt: ' + data.mpesaReceipt);
  }
});`} />
                        </section>

                        <section id="mobile-integration" className="mb-16">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Smartphone size={24} className="text-blue-500" /> Mobile Integration
                            </h2>
                            <p className="text-slate-400 mb-4">
                                The exact same code works for React Native! No native modules required.
                            </p>
                            <CodeBlock code={`import { Alert } from 'react-native';

// Inside your component
const handlePay = async () => {
  try {
    const res = await mpesa.pay({ phone: '0712345678', amount: 500 });
    
    mpesa.subscribeToUpdates(res.transactionId, (update) => {
      if (update.status === 'COMPLETED') {
        Alert.alert('Success', 'Payment Received!');
      }
    });
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};`} />
                        </section>

                    </motion.div>
                </main>
            </div>
        </div>
    );
}
