import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    BarChart3,
    Receipt,
    Settings,
    LogOut,
    Shield,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { path: '/admin', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background text-white flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex md:flex-col w-64 glass border-r border-white/10 fixed h-screen">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold">Admin Panel</span>
                            <p className="text-xs text-slate-400">M-Pesa Bridge</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-red-500 text-white'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all w-full"
                    >
                        <Settings size={20} />
                        <span className="font-medium">User Dashboard</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64">
                {/* Header */}
                <header className="glass border-b border-white/10 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 hover:bg-white/5 rounded-lg"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-orange-400">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                                <span className="font-bold">{user?.name?.charAt(0)}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:hidden fixed inset-0 glass z-50"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                                    <Shield size={20} className="text-white" />
                                </div>
                                <span className="text-xl font-bold">Admin Panel</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="p-4 space-y-2">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-red-500 text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
