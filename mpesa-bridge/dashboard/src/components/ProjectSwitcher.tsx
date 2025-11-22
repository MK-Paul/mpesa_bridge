import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Folder, Check } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { CreateProjectModal } from './CreateProjectModal';

export const ProjectSwitcher: React.FC = () => {
    const { projects, activeProject, switchProject, createProject } = useProjects();
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative mb-6" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                        <Folder size={18} />
                    </div>
                    <div className="text-left truncate">
                        <div className="text-xs text-gray-400">Project</div>
                        <div className="text-sm font-medium text-white truncate">
                            {activeProject?.name || 'Select Project'}
                        </div>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => {
                                    switchProject(project.id);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                            >
                                <span className={`text-sm ${activeProject?.id === project.id ? 'text-white font-medium' : 'text-gray-400'}`}>
                                    {project.name}
                                </span>
                                {activeProject?.id === project.id && (
                                    <Check size={14} className="text-blue-400" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-white/10 p-2">
                        <button
                            onClick={() => {
                                setIsModalOpen(true);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                            <Plus size={16} />
                            Create Project
                        </button>
                    </div>
                </div>
            )}

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={createProject}
            />
        </div>
    );
};
