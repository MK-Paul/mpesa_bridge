import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, Edit2, Trash2, Folder, Check, X } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import axios from 'axios';
import Toast from '../../components/Toast';

export default function Projects() {
    const { projects, activeProject, setActiveProject, refreshProjects } = useProjects();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) {
            setToast({ message: 'Please enter a project name', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/projects`,
                { name: newProjectName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setToast({ message: 'Project created successfully!', type: 'success' });
            setNewProjectName('');
            setShowCreateModal(false);
            await refreshProjects();
            setActiveProject(response.data.project);
        } catch (error: any) {
            setToast({
                message: error.response?.data?.message || 'Failed to create project',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProject = async (projectId: string) => {
        if (!editName.trim()) {
            setToast({ message: 'Please enter a project name', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/projects/${projectId}`,
                { name: editName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setToast({ message: 'Project updated successfully!', type: 'success' });
            setEditingId(null);
            await refreshProjects();
        } catch (error: any) {
            setToast({
                message: error.response?.data?.message || 'Failed to update project',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (projectId: string, projectName: string) => {
        if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/projects/${projectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setToast({ message: 'Project deleted successfully!', type: 'success' });
            await refreshProjects();

            // If deleted project was active, switch to first available project
            if (activeProject?.id === projectId && projects.length > 1) {
                const remainingProject = projects.find(p => p.id !== projectId);
                if (remainingProject) setActiveProject(remainingProject);
            }
        } catch (error: any) {
            setToast({
                message: error.response?.data?.message || 'Failed to delete project',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-slate-400 mt-1">Manage your M-Pesa integration projects</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl transition-all"
                >
                    <FolderPlus size={20} />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass rounded-2xl p-6 border transition-all ${activeProject?.id === project.id
                            ? 'border-primary shadow-lg shadow-primary/20'
                            : 'border-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Folder className="text-primary" size={24} />
                                </div>
                                <div>
                                    {editingId === project.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <h3 className="font-bold text-lg">{project.name}</h3>
                                            {activeProject?.id === project.id && (
                                                <span className="text-xs text-primary">Active</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-400 mb-4">
                            <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {editingId === project.id ? (
                                <>
                                    <button
                                        onClick={() => handleUpdateProject(project.id)}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-all disabled:opacity-50"
                                    >
                                        <Check size={16} />
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    {activeProject?.id !== project.id && (
                                        <button
                                            onClick={() => setActiveProject(project)}
                                            className="flex-1 bg-white/5 text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            Activate
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setEditingId(project.id);
                                            setEditName(project.name);
                                        }}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProject(project.id, project.name)}
                                        disabled={projects.length === 1}
                                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={projects.length === 1 ? 'Cannot delete your only project' : 'Delete project'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="glass rounded-2xl p-12 border border-white/10 text-center">
                    <Folder size={48} className="mx-auto mb-4 text-slate-400" />
                    <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
                    <p className="text-slate-400 mb-4">Create your first project to get started with M-Pesa integration</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-all"
                    >
                        Create Project
                    </button>
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-6 border border-white/10 w-full max-w-md"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Create New Project</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="My E-commerce Store"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                                />
                            </div>

                            <button
                                onClick={handleCreateProject}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Project'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
