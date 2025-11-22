import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export interface Project {
    id: string;
    name: string;
    publicKey: string;
    secretKey: string;
    testPublicKey?: string;
    testSecretKey?: string;
    webhookUrl?: string;
    webhookSecret?: string;
    createdAt: string;
}

export type Environment = 'LIVE' | 'SANDBOX';

interface ProjectContextType {
    projects: Project[];
    activeProject: Project | null;
    isLoading: boolean;
    environment: Environment;
    createProject: (name: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    switchProject: (projectId: string) => void;
    setActiveProject: (project: Project) => void;
    refreshProjects: () => Promise<void>;
    toggleEnvironment: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [environment, setEnvironment] = useState<Environment>('LIVE');

    const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(response.data.projects);

            // Restore active project from local storage or default to first one
            const savedProjectId = localStorage.getItem('activeProjectId');
            if (savedProjectId) {
                const saved = response.data.projects.find((p: Project) => p.id === savedProjectId);
                if (saved) {
                    setActiveProject(saved);
                } else if (response.data.projects.length > 0) {
                    setActiveProject(response.data.projects[0]);
                }
            } else if (response.data.projects.length > 0) {
                setActiveProject(response.data.projects[0]);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Restore environment from local storage
        const savedEnv = localStorage.getItem('environment');
        if (savedEnv === 'SANDBOX' || savedEnv === 'LIVE') {
            setEnvironment(savedEnv);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchProjects();
        } else {
            setProjects([]);
            setActiveProject(null);
        }
    }, [user]);

    const createProject = async (name: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/projects`,
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchProjects();
            // Switch to new project
            switchProject(response.data.project.id);
        } catch (error) {
            throw error;
        }
    };

    const deleteProject = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If deleting active project, clear selection
            if (activeProject?.id === id) {
                localStorage.removeItem('activeProjectId');
                setActiveProject(null);
            }

            await fetchProjects();
        } catch (error) {
            throw error;
        }
    };

    const switchProject = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setActiveProject(project);
            localStorage.setItem('activeProjectId', projectId);
        }
    };

    const toggleEnvironment = () => {
        const newEnv = environment === 'LIVE' ? 'SANDBOX' : 'LIVE';
        setEnvironment(newEnv);
        localStorage.setItem('environment', newEnv);
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            activeProject,
            isLoading,
            environment,
            createProject,
            deleteProject,
            switchProject,
            setActiveProject,
            refreshProjects: fetchProjects,
            toggleEnvironment
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};
