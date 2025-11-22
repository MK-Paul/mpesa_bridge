import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading...</div>;
    }

    // Temporarily bypass auth for testing
// return <Outlet />;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
