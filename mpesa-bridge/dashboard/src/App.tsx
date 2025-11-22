import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Documentation from './pages/Documentation';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ProjectProvider } from './context/ProjectContext';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Overview from './pages/dashboard/Overview';
import Transactions from './pages/dashboard/Transactions';
import APIKeys from './pages/dashboard/APIKeys';
import Settings from './pages/dashboard/Settings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes (Dashboard) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Overview />} />
                <Route path="/dashboard/transactions" element={<Transactions />} />
                <Route path="/dashboard/keys" element={<APIKeys />} />
                <Route path="/dashboard/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Protected Routes (Admin) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminAnalytics />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
