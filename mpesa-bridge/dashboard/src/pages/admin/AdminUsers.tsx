import { motion } from 'framer-motion';
import { Users as UsersIcon, Search, Ban, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: string;
    _count: {
        projects: number;
    };
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/users?search=${searchQuery}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId: string) => {
        if (!confirm('Are you sure you want to ban this user?')) return;

        try {
            setProcessing(userId);
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/users/${userId}/ban`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
        } catch (error) {
            console.error('Failed to ban user:', error);
            alert('Failed to ban user');
        } finally {
            setProcessing(null);
        }
    };

    const handleUnban = async (userId: string) => {
        try {
            setProcessing(userId);
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/users/${userId}/unban`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
        } catch (error) {
            console.error('Failed to unban user:', error);
            alert('Failed to unban user');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">User Management</h2>
                <p className="text-slate-400">Manage platform users</p>
            </div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border border-white/10"
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                </div>
            </motion.div>

            {/* Users Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl border border-white/10 overflow-hidden"
            >
                {users.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <UsersIcon size={64} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Name</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Email</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Role</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Projects</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Joined</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-white">{user.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-300">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                ? 'bg-orange-500/20 text-orange-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'ACTIVE'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white">{user._count.projects}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-400 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role !== 'ADMIN' && (
                                                user.status === 'ACTIVE' ? (
                                                    <button
                                                        onClick={() => handleBan(user.id)}
                                                        disabled={processing === user.id}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm disabled:opacity-50"
                                                    >
                                                        {processing === user.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Ban size={14} />
                                                        )}
                                                        Ban
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnban(user.id)}
                                                        disabled={processing === user.id}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-sm disabled:opacity-50"
                                                    >
                                                        {processing === user.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Check size={14} />
                                                        )}
                                                        Unban
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
